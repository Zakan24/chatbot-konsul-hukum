"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X, Send, Loader2, MessageSquare, ChevronDown, MoreVertical, Scale } from "lucide-react";

import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, type RouterOutputs } from "nvn/trpc/react";
import { type SourceCitation } from "nvn/server/ai/chat-agent";

interface ChatShellProps {
  initialChatId: string | null;
}

export function ChatShell({ initialChatId }: ChatShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Track the current chat ID independently from the prop
  const [currentChatId, setCurrentChatId] = useState<string | null>(initialChatId);

  const [optimisticMessages, setOptimisticMessages] = useState<Array<{
    id: string | number;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
    sources: SourceCitation[] | undefined;
    feedback: { rating: "suka" | "tidak_suka" } | null;
  }>>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track the latest AI message ID for typewriter animation
  const [newAssistantMessageId, setNewAssistantMessageId] = useState<number | null>(null);

  // Track if we're in the process of creating a new chat (to avoid showing "Loading pesan...")
  const isCreatingNewChat = useRef(false);

  const utils = api.useUtils();

  // Sync currentChatId with initialChatId when it changes (e.g., navigation via sidebar)
  useEffect(() => {
    setCurrentChatId(initialChatId);
  }, [initialChatId]);

  const historyQuery = api.chat.history.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const hasActiveChat = Boolean(currentChatId);

  const messagesQuery = api.chat.messages.useQuery(
    { chatId: currentChatId ?? "" },
    {
      enabled: hasActiveChat,
      refetchOnReconnect: true,
    },
  );

  const createChatMutation = api.chat.create.useMutation();

  const sendMessageMutation = api.chat.sendMessage.useMutation();

  const isComposerBusy =
    createChatMutation.isPending || sendMessageMutation.isPending;

  const isAIThinking = sendMessageMutation.isPending;

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data, optimisticMessages, scrollToBottom]);

  // Clear optimistic messages when chat changes
  useEffect(() => {
    // Only clear if we're NOT creating a new chat (e.g. switching via sidebar)
    if (!isCreatingNewChat.current) {
      setOptimisticMessages([]);
    }
  }, [currentChatId]);

  // Clear optimistic messages when real messages are loaded
  useEffect(() => {
    if (messagesQuery.isSuccess && messagesQuery.data && messagesQuery.data.length > 0) {
      setOptimisticMessages([]);
      // Reset the flag once messages are loaded
      isCreatingNewChat.current = false;
    }
  }, [messagesQuery.isSuccess, messagesQuery.data]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;

    const text = message.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI: Add user message immediately
    setOptimisticMessages(prev => [...prev, {
      id: tempId,
      role: "user",
      content: text,
      createdAt: new Date(),
      sources: undefined,
      feedback: null
    }]);
    setMessage("");

    // Scroll to bottom after adding optimistic message
    setTimeout(() => scrollToBottom(), 100);

    try {
      let targetChatId = currentChatId;

      if (!targetChatId) {
        // Mark that we're creating a new chat
        isCreatingNewChat.current = true;

        const newChat = await createChatMutation.mutateAsync();
        targetChatId = newChat.id;
        // Update local state to track the new chat ID
        setCurrentChatId(targetChatId);
        // Use native History API to update URL without page reload
        window.history.replaceState(null, '', `/chat/${newChat.id}`);
      }

      if (!targetChatId) {
        throw new Error("Gagal menentukan chat ID untuk percakapan.");
      }

      const result = await sendMessageMutation.mutateAsync({
        chatId: targetChatId,
        message: text,
      });

      // Track the new assistant message for typewriter animation
      if (result.assistantMessage?.id) {
        setNewAssistantMessageId(result.assistantMessage.id);
      }

      await Promise.all([
        utils.chat.messages.invalidate({ chatId: targetChatId }),
        utils.chat.history.invalidate(),
      ]);

      // Don't clear optimistic messages here - let them be replaced by real messages
      // This keeps the user's message visible while AI is thinking
    } catch (error) {
      console.error("[Chat] Failed to send message", error);
      setMessage(text);
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      // Reset flag on error
      isCreatingNewChat.current = false;
    }
  }, [message, currentChatId, createChatMutation, sendMessageMutation, utils, scrollToBottom]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  const handleCreateChat = () => {
    // Reset to new chat state
    setCurrentChatId(null);
    setOptimisticMessages([]);
    setNewAssistantMessageId(null);
    setMessage("");
    // Use window.history to avoid page reload
    if (pathname !== "/chat") {
      window.history.pushState(null, '', '/chat');
    }
  };

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: () => {
      void utils.chat.history.invalidate();
      setDeletingChatId(null);
      // If deleting current chat, redirect to main chat
      if (deletingChatId === currentChatId) {
        router.push("/chat");
      }
    },
  });

  const renameChatMutation = api.chat.renameChat.useMutation({
    onSuccess: () => {
      void utils.chat.history.invalidate();
      setRenamingChatId(null);
      setNewChatTitle("");
    },
  });

  const handleRenameClick = (chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId);
    setNewChatTitle(currentTitle);
  };

  const handleRenameSubmit = () => {
    if (renamingChatId && newChatTitle.trim()) {
      renameChatMutation.mutate({
        chatId: renamingChatId,
        title: newChatTitle.trim(),
      });
    }
  };

  const handleDeleteClick = (chatId: string) => {
    setDeletingChatId(chatId);
  };

  const handleDeleteConfirm = () => {
    if (deletingChatId) {
      deleteChatMutation.mutate({ chatId: deletingChatId });
    }
  };

  const sidebarContent = useMemo(() => {
    if (historyQuery.isLoading) {
      return (
        <div className="text-sidebar-foreground/60 p-3 text-sm">
          Loading riwayat...
        </div>
      );
    }

    if (historyQuery.isError) {
      return (
        <div className="text-destructive p-3 text-xs">
          Gagal memuat riwayat chat.
        </div>
      );
    }

    if (historyQuery.isSuccess && historyQuery.data.length === 0) {
      return (
        <div className="text-sidebar-foreground/60 p-3 text-xs">
          Belum ada riwayat percakapan. Mulai percakapan baru untuk memulai.
        </div>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const data = historyQuery.data || [];

    const groups = data.reduce((acc, chat) => {
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);

      if (chatDate.getTime() === today.getTime()) {
        acc.today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        acc.yesterday.push(chat);
      } else {
        acc.older.push(chat);
      }
      return acc;
    }, { today: [], yesterday: [], older: [] } as Record<"today" | "yesterday" | "older", typeof data>);

    const renderGroup = (title: string, chats: typeof data | undefined) => {
      if (!chats || chats.length === 0) return null;

      return (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-3">
            {title} <ChevronDown className="w-3 h-3" />
          </h3>
          <ul className="space-y-3">
            {chats.map((chat) => {
              const isSelected = currentChatId === chat.id;

              return (
                <li key={chat.id} className={`text-[13px] flex items-start gap-2 cursor-pointer hover:text-gray-900 truncate justify-between group ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  <Link href={`/chat/${chat.id}`} className="flex-1 flex items-start gap-2 truncate" onClick={handleCloseSidebar}>
                    <MessageSquare className="w-4 h-4 mt-0.5 opacity-50 shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRenameClick(chat.id, chat.title)} className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        Ubah Judul
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(chat.id)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        Hapus Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        </div>
      );
    };

    return (
      <>
        {renderGroup("Hari Ini", groups.today)}
        {renderGroup("Kemarin", groups.yesterday)}
        {renderGroup("Sebelumnya", groups.older)}
      </>
    );
  }, [historyQuery, currentChatId, handleRenameClick, handleDeleteClick]);

  return (
    <div className="bg-gradient-to-br from-[#E2EAFB] via-[#F3E7F8] to-[#E2F1F8] h-screen w-screen flex items-center justify-center p-2 md:p-4 overflow-hidden">
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Mobile Drawer (Combining Nav and Right Aside) */}
      <aside className={`
        bg-white border-l border-gray-100
        flex flex-col
        fixed top-0 bottom-0 right-0
        z-50 w-72
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        md:hidden
      `}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#404040] text-white flex items-center justify-center font-bold shadow-sm">
              KH
            </div>
            <span className="font-semibold text-gray-800">Konsul Hukum</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => {
              handleCreateChat();
              handleCloseSidebar();
            }}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 flex justify-center items-center gap-2 font-medium text-sm shadow-sm hover:bg-gray-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Chat Baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">{sidebarContent}</div>
        </div>
        <div className="p-4 border-t border-gray-100">
           <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
             <LogOut className="mr-2 h-4 w-4" />
             Logout
           </Button>
        </div>
      </aside>

      <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl md:rounded-[2.5rem] w-full max-w-[1400px] h-full md:h-[95vh] flex flex-col md:flex-row overflow-hidden relative">

        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-gray-100/50 shrink-0 bg-white/50">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-[#1A1A1A] font-semibold text-sm tracking-wide">Konsultasi Hukum AI</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image ?? ""} />
            <AvatarFallback>{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
        </header>

        {/* Desktop Nav Kiri */}
        <nav className="w-20 hidden md:flex flex-col items-center py-8 gap-6 border-r border-gray-100/50 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#404040] text-white flex items-center justify-center font-bold text-xl shadow-lg mb-4">
            KH
          </div>
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer outline-none hover:opacity-90 transition">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-56 ml-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-gray-500">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Main Tengah */}
        <main className="flex-1 flex flex-col relative h-full w-full overflow-hidden">
          {/* Desktop Header */}
          <header className="hidden md:flex h-20 items-center justify-center shrink-0">
            <h1 className="text-[#1A1A1A] font-semibold text-sm tracking-wide">Konsultasi Hukum AI</h1>
          </header>

          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-24 pt-4 pb-4 flex flex-col gap-6 scroll-smooth custom-scrollbar">
            {!hasActiveChat && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-xl mx-auto px-4 mt-12">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Scale className="w-8 h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                  Konsultasi Hukum AI
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tanyakan masalah hukum Anda. AI kami akan memberikan analisis berdasarkan peraturan perundang-undangan di Indonesia.
                </p>
              </div>
            )}

            {hasActiveChat && messagesQuery.isLoading && !isCreatingNewChat.current && (
              <div className="text-gray-500 py-8 text-center text-sm">
                Loading pesan...
              </div>
            )}

            {hasActiveChat && messagesQuery.isSuccess && messagesQuery.data?.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isNew={msg.id === newAssistantMessageId} />
            ))}

            {optimisticMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg as RouterOutputs["chat"]["messages"][number]} />
            ))}

            {isAIThinking && (
              <div className="flex justify-start gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-2">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            {hasActiveChat && messagesQuery.isError && (
              <div className="text-red-500 py-8 text-center text-sm">
                Gagal memuat pesan. Silakan muat ulang halaman.
              </div>
            )}

            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>

          {/* Input Area */}
          <div className="w-full px-4 md:px-8 lg:px-24 flex justify-center pb-4 md:pb-8 pt-2 shrink-0 z-10">
            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
              <div className="bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100 rounded-full flex items-center px-2 py-2 md:px-4 md:py-3 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik masalah hukum Anda..."
                  className="flex-1 min-h-[24px] max-h-[120px] resize-none border-0 bg-transparent px-4 py-2 text-[15px] text-gray-700 placeholder-gray-400 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-hide"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={isComposerBusy}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isComposerBusy || !message.trim()}
                  className="w-10 h-10 shrink-0 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-gray-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed ml-2 cursor-pointer"
                >
                  {isComposerBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  )}
                </button>
              </div>
              <div className="text-center mt-3 text-[11px] text-gray-400">
                AI dapat membuat kesalahan. Harap verifikasi informasi penting.
              </div>
            </form>
          </div>
        </main>

        {/* Desktop Aside (Kanan) */}
        <aside className="w-80 hidden md:flex bg-gray-50/50 border-l border-gray-100/80 p-6 flex-col shrink-0">
          <button
            onClick={handleCreateChat}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 flex justify-center items-center gap-2 font-medium text-sm shadow-sm hover:bg-gray-50 transition mb-4 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Chat Baru
          </button>
          
          <div className="flex flex-col gap-3 mb-4">
            <Link href="/direktori" className="w-full bg-indigo-600 text-white rounded-2xl py-3 flex justify-center items-center gap-2 font-medium text-sm shadow-md hover:bg-indigo-700 transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
              <span>Direktori Peraturan</span>
            </Link>
          </div>

          <button className="w-full bg-[#1A1A1A] text-white rounded-2xl py-3 flex justify-center items-center gap-2 font-medium text-sm shadow-md hover:bg-gray-800 transition mb-6 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            Konsultasi Langsung
          </button>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {sidebarContent}
          </div>
        </aside>

      </div>
      {/* Rename Chat Modal */}
      {
        renamingChatId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Ubah Judul Chat</h3>
              <Input
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Masukkan judul baru..."
                className="mb-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRenamingChatId(null);
                    setNewChatTitle("");
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleRenameSubmit}
                  disabled={!newChatTitle.trim() || renameChatMutation.isPending}
                >
                  {renameChatMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Chat Confirmation */}
      {
        deletingChatId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Hapus Chat</h3>
              <p className="text-muted-foreground mb-6">
                Apakah Anda yakin ingin menghapus chat ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeletingChatId(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteChatMutation.isPending}
                >
                  {deleteChatMutation.isPending ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
