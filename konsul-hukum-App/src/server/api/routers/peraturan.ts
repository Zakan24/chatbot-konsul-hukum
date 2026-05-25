import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "nvn/server/api/trpc";

export const peraturanRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        kategori: z.string().optional(),
        tahun: z.string().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;

      if (input?.kategori) where.kategori_hukum = input.kategori;
      if (input?.tahun) where.tahun = input.tahun;

      if (input?.search) {
        where.OR = [
          { judul: { contains: input.search, mode: "insensitive" } },
          { sub_judul: { contains: input.search, mode: "insensitive" } },
          { isi: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [items, totalCount] = await Promise.all([
        ctx.db.peraturan.findMany({
          where,
          orderBy: [{ tahun: "desc" }, { judul: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.peraturan.count({ where }),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
      };
    }),

  // Get distinct values for filter dropdowns
  filterOptions: publicProcedure.query(async ({ ctx }) => {
    const [kategoriValues, tahunValues] =
      await Promise.all([
        ctx.db.peraturan.findMany({
          select: { kategori_hukum: true },
          distinct: ["kategori_hukum"],
          orderBy: { kategori_hukum: "asc" },
        }),
        ctx.db.peraturan.findMany({
          select: { tahun: true },
          distinct: ["tahun"],
          orderBy: { tahun: "desc" },
        }),
      ]);

    return {
      kategori: kategoriValues.map((v) => v.kategori_hukum).filter(Boolean),
      tahun: tahunValues.map((v) => v.tahun).filter(Boolean),
    };
  }),
});
