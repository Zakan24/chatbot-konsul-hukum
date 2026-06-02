import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { answerLegalQuestion, type SourceCitation } from 'nvn/server/ai/chat-agent';
import { createTRPCRouter, protectedProcedure, publicProcedure } from 'nvn/server/api/trpc';

const chatIdInput = z.object({
  chatId: z.string().uuid(),
});

// Helper: load singleton config with defaults
async function getQuotaConfig(db: any) {
  let config = await db.quotaConfig.findFirst({ where: { id: 1 } });
  if (!config) {
    config = {
      defaultCredits: 20,
      guestMessageLimit: 1,
      spamTimeWindowSec: 30,
      minMessageLength: 10,
    };
  }
  return config;
}

// Helper: check spam patterns and return dynamic cost
async function computeCreditCost(
  db: any,
  userId: string,
  message: string,
  baseCost: number,
  spamTimeWindowSec: number,
  minMessageLength: number
): Promise<{ cost: number; spamStreak: number; isSpam: boolean }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { cost: baseCost, spamStreak: 0, isSpam: false };

  // If admin flagged this user, cost is fixed to 3x and we ignore streaks
  if (user.isFlagged) {
    return { cost: 3, spamStreak: user.spamStreak, isSpam: true };
  }

  let isSpam = false;
  let spamStreak = user.spamStreak;

  // 1. Check if message is too short
  if (message.length < minMessageLength) {
    isSpam = true;
  }

  // 2. Check if sent too quickly (spamming enter)
  if (user.lastMessageAt) {
    const secondsSinceLastMsg = (Date.now() - user.lastMessageAt.getTime()) / 1000;
    if (secondsSinceLastMsg < spamTimeWindowSec) {
      isSpam = true;
    }
  }

  if (isSpam) {
    spamStreak += 1;
  } else {
    // Reset streak if legitimate message
    spamStreak = 0;
  }

  // Cost escalates with spam streak
  let cost = baseCost;
  if (spamStreak >= 3) {
    cost = 2; // 2x cost
  }
  if (spamStreak >= 6) {
    cost = 3; // 3x cost max
  }

  return { cost, spamStreak, isSpam };
}

export const chatRouter = createTRPCRouter({
  history: protectedProcedure.query(async ({ ctx }) => {
    const chats = await ctx.db.chat.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return chats;
  }),

  messages: protectedProcedure.input(chatIdInput).query(async ({ ctx, input }) => {
    const chat = await ctx.db.chat.findFirst({
      where: {
        id: input.chatId,
        userId: ctx.session.user.id,
      },
    });

    if (!chat) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat tidak ditemukan' });
    }

    const messages = await ctx.db.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      include: {
        feedback: true, // Include feedback data
      },
    });

    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.createdAt,
      sources: (msg.sources ?? undefined) as SourceCitation[] | undefined,
      feedback: msg.feedback ? { rating: msg.feedback.rating as 'suka' | 'tidak_suka' } : null,
    }));
  }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const chat = await ctx.db.chat.create({
      data: {
        userId: ctx.session.user.id,
      },
    });

    return chat;
  }),

  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { credits: true, isFlagged: true, creditCostPerMsg: true },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return user;
  }),

  guestMessage: publicProcedure
    .input(z.object({ message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const ip = ctx.ip || 'unknown';

      // 1. Load config
      const config = await getQuotaConfig(ctx.db);

      // 2. Check how many messages this IP has sent
      const usageCount = await ctx.db.guestUsage.count({
        where: { ip, actionType: 'chat' },
      });

      if (usageCount >= config.guestMessageLimit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Batas pesan gratis habis. Silakan login untuk melanjutkan.',
        });
      }

      // 3. Process AI query without saving to database (guest has no history)
      const trimmedMessage = input.message.trim();
      const { answer, sources } = await answerLegalQuestion(trimmedMessage, []);

      // 4. Record usage
      await ctx.db.guestUsage.create({
        data: { ip, actionType: 'chat' },
      });

      return {
        answer,
        sources,
        creditsRemaining: config.guestMessageLimit - usageCount - 1,
      };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
        message: z.string().min(1, 'Pesan tidak boleh kosong').max(2000, 'Pesan terlalu panjang'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: { id: input.chatId, userId: ctx.session.user.id },
      });

      if (!chat) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat tidak ditemukan' });
      }

      const trimmedMessage = input.message.trim();

      // 1. Credit & Spam Check
      const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id } });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const config = await getQuotaConfig(ctx.db);
      const { cost, spamStreak } = await computeCreditCost(
        ctx.db,
        user.id,
        trimmedMessage,
        user.creditCostPerMsg,
        config.spamTimeWindowSec,
        config.minMessageLength
      );

      if (user.credits < cost) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Kredit tidak cukup. Dibutuhkan: ${cost}, Tersedia: ${user.credits}`,
        });
      }

      // NEW: Fetch recent message history for conversational context (last 10 messages)
      const recentMessages = await ctx.db.message.findMany({
        where: { chatId: chat.id },
        orderBy: { createdAt: 'asc' },
        take: 10,
        select: {
          role: true,
          content: true,
        },
      });

      const userMessage = await ctx.db.message.create({
        data: {
          chatId: chat.id,
          role: 'user',
          content: trimmedMessage,
        },
      });

      if (chat.title === 'Percakapan Baru') {
        await ctx.db.chat.update({
          where: { id: chat.id },
          data: { title: trimmedMessage.slice(0, 60) },
        });
      }

      // NEW: Pass message history to AI for conversational context
      const messageHistory = recentMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const { answer, sources } = await answerLegalQuestion(trimmedMessage, messageHistory);

      const assistantMessage = await ctx.db.message.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          content: answer,
          sources,
        },
      });

      // Deduct credits and update spam streak
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: cost },
          spamStreak,
          lastMessageAt: new Date(),
        },
      });

      return {
        userMessage: {
          id: userMessage.id,
          role: 'user' as const,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: 'assistant' as const,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
          sources,
        },
        creditsRemaining: user.credits - cost,
        creditCost: cost,
      };
    }),

  submitFeedback: protectedProcedure
    .input(
      z.object({
        messageId: z.number().int().positive(),
        rating: z.enum(['suka', 'tidak_suka']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.message.findFirst({
        where: {
          id: input.messageId,
          chat: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pesan tidak ditemukan' });
      }

      const feedback = await ctx.db.feedback.upsert({
        where: { messageId: message.id },
        create: {
          messageId: message.id,
          userId: ctx.session.user.id,
          rating: input.rating,
        },
        update: {
          rating: input.rating,
        },
      });

      return feedback;
    }),

  deleteFeedback: protectedProcedure
    .input(
      z.object({
        messageId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.message.findFirst({
        where: {
          id: input.messageId,
          chat: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pesan tidak ditemukan' });
      }

      // Delete the feedback if it exists
      await ctx.db.feedback.deleteMany({
        where: {
          messageId: message.id,
          userId: ctx.session.user.id,
        },
      });

      return { success: true };
    }),

  deleteChat: protectedProcedure
    .input(chatIdInput)
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId,
          userId: ctx.session.user.id,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat tidak ditemukan' });
      }

      // Delete all messages and feedback for this chat
      await ctx.db.message.deleteMany({
        where: { chatId: chat.id },
      });

      // Delete the chat
      await ctx.db.chat.delete({
        where: { id: chat.id },
      });

      return { success: true };
    }),

  renameChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
        title: z.string().min(1, 'Judul tidak boleh kosong').max(100, 'Judul terlalu panjang'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId,
          userId: ctx.session.user.id,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat tidak ditemukan' });
      }

      const updatedChat = await ctx.db.chat.update({
        where: { id: chat.id },
        data: { title: input.title.trim() },
      });

      return updatedChat;
    }),

  submitReport: protectedProcedure
    .input(
      z.object({
        messageId: z.number().int().positive().optional(),
        content: z.string().min(1, 'Pesan tidak boleh kosong').max(2000, 'Pesan terlalu panjang'),
        type: z.enum(['saran', 'kesalahan']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.messageId) {
        const message = await ctx.db.message.findFirst({
          where: {
            id: input.messageId,
            chat: {
              userId: ctx.session.user.id,
            },
          },
        });

        if (!message) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pesan tidak ditemukan' });
        }
      }

      const report = await ctx.db.report.create({
        data: {
          userId: ctx.session.user.id,
          messageId: input.messageId,
          content: input.content,
          type: input.type,
        },
      });

      return report;
    }),
});

