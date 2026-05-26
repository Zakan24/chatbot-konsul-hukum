"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTypewriter } from "nvn/utils/useTypewriter"
import { Scale } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api, type RouterOutputs } from "nvn/trpc/react"

type ChatMessageData = RouterOutputs["chat"]["messages"][number]

interface ChatMessageProps {
  message: ChatMessageData
  /** Whether this message was just received (triggers typewriter animation) */
  isNew?: boolean
}

// Collapsible sources drawer component
function SourcesDrawer({ sources }: { sources: Array<{ source: string; page?: number; snippet?: string }> }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2 pl-2 mt-4">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:text-gray-600 transition relative z-10"
      >
        <span>Referensi Dokumen (RAG)</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-3 mt-2">
          {sources.map((source, idx) => (
            <div key={idx} className="bg-black border-2 border-[#CA8A04] rounded-2xl p-4 shadow-md relative overflow-hidden group hover:shadow-lg transition">
              <div className="flex gap-3 items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#CA8A04]">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                </svg>
                <h4 className="font-semibold text-white text-sm">{source.source}</h4>
              </div>
              {source.snippet && (
                <p className="text-sm text-gray-300 italic leading-relaxed">
                  "{source.snippet}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChatMessage({ message, isNew = false }: ChatMessageProps) {
  // Typewriter animation for new assistant messages
  const shouldAnimate = isNew && message.role === "assistant"
  const { displayText, isAnimating, skip } = useTypewriter(message.content, shouldAnimate)
  const [selectedFeedback, setSelectedFeedback] = useState<"suka" | "tidak_suka" | null>(
    message.feedback?.rating ?? null
  )

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportType, setReportType] = useState<"saran" | "kesalahan">("saran")
  const [reportContent, setReportContent] = useState("")

  // Update local state when message feedback changes (e.g., after refetch)
  useEffect(() => {
    setSelectedFeedback(message.feedback?.rating ?? null)
  }, [message.feedback])

  const feedbackMutation = api.chat.submitFeedback.useMutation({
    onSuccess: (_, variables) => {
      setSelectedFeedback(variables.rating)
    },
  })

  const deleteFeedbackMutation = api.chat.deleteFeedback.useMutation({
    onSuccess: () => {
      setSelectedFeedback(null)
    },
  })

  const reportMutation = api.chat.submitReport.useMutation({
    onSuccess: () => {
      setIsReportOpen(false)
      setReportContent("")
      alert("Laporan berhasil dikirim. Terima kasih!")
    },
    onError: () => {
      alert("Gagal mengirim laporan. Coba lagi nanti.")
    }
  })

  const handleFeedback = (rating: "suka" | "tidak_suka") => {
    // If clicking the same button, cancel the selection
    if (selectedFeedback === rating) {
      deleteFeedbackMutation.mutate(
        { messageId: message.id },
        {
          onError: (error) => {
            console.error("[Chat] Failed to delete feedback", error)
          },
        },
      )
      return
    }

    setSelectedFeedback(rating)

    feedbackMutation.mutate(
      {
        messageId: message.id,
        rating,
      },
      {
        onError: (error) => {
          console.error("[Chat] Failed to submit feedback", error)
          setSelectedFeedback(null)
        },
      },
    )
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportContent.trim()) return
    reportMutation.mutate({
      messageId: message.id,
      content: reportContent,
      type: reportType
    })
  }

  return (
    <>
      <div className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {/* AI Avatar - Left side for assistant */}
        {message.role === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-[#6B0B0C]/10 text-[#6B0B0C] flex items-center justify-center shrink-0 mt-2">
            <Scale className="w-4 h-4" />
          </div>
        )}

        <div className="max-w-[80%] space-y-2">
          {/* Message Bubble */}
          <div
            className={`px-6 py-4 shadow-sm ${message.role === 'user'
              ? 'bg-[#6B0B0C] text-white rounded-3xl rounded-tr-sm'
              : 'bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] rounded-3xl rounded-tl-sm'
              }`}
          >
            {message.role === 'assistant' ? (
              <div className="prose-chat text-sm" onClick={isAnimating ? skip : undefined} style={isAnimating ? { cursor: 'pointer' } : undefined}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {shouldAnimate ? displayText : message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="leading-relaxed whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {/* Feedback Buttons - Only for assistant messages */}
          {message.role === 'assistant' && (
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('suka')}
                className={`h-8 px-2 cursor-pointer ${selectedFeedback === 'suka'
                  ? 'bg-accent/20 text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Suka"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('tidak_suka')}
                className={`h-8 px-2 cursor-pointer ${selectedFeedback === 'tidak_suka'
                  ? 'bg-destructive/20 text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Tidak suka"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 14V2" />
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                </svg>
              </Button>

              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(message.content)
                }}
                className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Salin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </Button>

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Lainnya"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setIsReportOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" x2="4" y1="22" y2="15" />
                    </svg>
                    Saran atau laporkan kesalahan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Sources - Collapsible drawer (only shown after typewriter completes) */}
          {message.role === "assistant" && !isAnimating && Array.isArray(message.sources) && message.sources.length > 0 && (
            <SourcesDrawer sources={message.sources as Array<{ source: string; page?: number; snippet?: string }>} />
          )}
        </div>

        {/* User Avatar - Right side for user */}
        {message.role === 'user' && (
          <div className="w-8 h-8 rounded-full bg-[#CA8A04] flex items-center justify-center text-white shrink-0 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">Saran atau Laporkan Kesalahan</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Jenis Laporan</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="reportType" 
                      value="saran" 
                      checked={reportType === 'saran'} 
                      onChange={(e) => setReportType(e.target.value as 'saran' | 'kesalahan')} 
                    />
                    Saran
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="reportType" 
                      value="kesalahan" 
                      checked={reportType === 'kesalahan'} 
                      onChange={(e) => setReportType(e.target.value as 'saran' | 'kesalahan')} 
                    />
                    Laporkan Kesalahan
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Pesan</label>
                <textarea
                  className="w-full h-32 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none mt-1"
                  placeholder="Ceritakan detail saran atau masalah yang Anda temukan..."
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsReportOpen(false); setReportContent(''); }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={reportMutation.isPending || !reportContent.trim()}
                >
                  {reportMutation.isPending ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
