'use client'

import { useState } from 'react'
import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'
import { ThumbsUp, ThumbsDown, ArrowLeft, MessageSquare, Calendar } from 'lucide-react'

export default function AdminChatsPage() {
  const [page, setPage] = useState(1)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const query = api.admin.chats.useQuery({ page, limit: 10 }, { retry: false })
  const detailQuery = api.admin.chatDetail.useQuery(
    { chatId: selectedChatId! },
    { enabled: !!selectedChatId, retry: false }
  )
  const data = query.data

  if (query.isError && query.error.data?.code === 'UNAUTHORIZED') {
    window.location.href = '/admin/login'
    return null
  }

  // Detail view
  if (selectedChatId && detailQuery.data) {
    const chat = detailQuery.data
    return (
      <AdminLayout>
        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={() => setSelectedChatId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 bg-white/60 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white transition-all cursor-pointer self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar</span>
          </button>
          
          <h2 className="text-2xl font-bold text-gray-950 mt-2">{chat.title}</h2>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mt-1">
            <span>Oleh: {chat.user.name ?? chat.user.email}</span>
            <span>·</span>
            <span>{new Date(chat.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>

        <div className="space-y-4 max-w-3xl pb-8">
          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300 ${
                msg.role === 'user'
                  ? 'bg-[#1C2544] text-white border border-[#1C2544] ml-12 shadow-md'
                  : 'bg-white/80 backdrop-blur-md border border-white/60 mr-12 text-gray-800 leading-relaxed'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2 last:border-none last:pb-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-gray-300' : 'text-[#1C2544]'}`}>
                  {msg.role === 'user' ? 'Pengguna' : 'Asisten AI'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.feedback && (
                  <span className={`flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    msg.feedback.rating === 'suka'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                      : 'bg-rose-50 text-rose-700 border-rose-100/50'
                  }`}>
                    {msg.feedback.rating === 'suka' ? (
                      <><ThumbsUp className="w-2.5 h-2.5" /> Suka</>
                    ) : (
                      <><ThumbsDown className="w-2.5 h-2.5" /> Tidak Suka</>
                    )}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          ))}
        </div>
      </AdminLayout>
    )
  }

  // List view
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-950">Riwayat Percakapan</h2>
        <p className="text-sm text-gray-500 mt-1">Daftar seluruh percakapan pengguna dengan AI Konsul Hukum</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Judul Percakapan</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pengguna</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Jumlah Pesan</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Memuat data percakapan...
                  </td>
                </tr>
              )}
              {data?.items.map((chat) => (
                <tr
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className="hover:bg-gray-50/40 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800 hover:text-[#1C2544] transition-colors">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{chat.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-medium">{chat.user.name ?? chat.user.email}</td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#D3BA78]/10 text-[#D3BA78] border border-[#D3BA78]/20">
                      {chat._count.messages} pesan
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {new Date(chat.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Belum ada riwayat percakapan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pb-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="h-9 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:text-gray-400 flex items-center justify-center"
          >
            ← Sebelumnya
          </button>
          
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Halaman {page} / {data.totalPages}
          </span>
          
          <button 
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} 
            disabled={page === data.totalPages}
            className="h-9 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:text-gray-400 flex items-center justify-center"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
