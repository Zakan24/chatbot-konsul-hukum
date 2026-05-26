'use client'

import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'
import { Users, MessageCircle, FileText, ThumbsUp, ThumbsDown, Scale } from 'lucide-react'
import Link from 'next/link'

const statCards = [
  { key: 'users', label: 'Total Pengguna', icon: Users, color: 'text-white', bg: 'bg-[#6B0B0C]' },
  { key: 'chats', label: 'Total Chat', icon: MessageCircle, color: 'text-white', bg: 'bg-[#6B0B0C]' },
  { key: 'messages', label: 'Total Pesan', icon: FileText, color: 'text-white', bg: 'bg-[#6B0B0C]' },
  { key: 'feedbackSuka', label: 'Feedback Suka', icon: ThumbsUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-100/50' },
  { key: 'feedbackTidakSuka', label: 'Feedback Tidak Suka', icon: ThumbsDown, color: 'text-rose-700', bg: 'bg-rose-50 border border-rose-100/50' },
  { key: 'peraturan', label: 'Total Peraturan', icon: Scale, color: 'text-white', bg: 'bg-[#6B0B0C]' },
] as const

export default function AdminDashboardPage() {
  const statsQuery = api.admin.stats.useQuery(undefined, { retry: false })
  const recentChatsQuery = api.admin.chats.useQuery({ page: 1, limit: 5 }, { retry: false })
  const recentFeedbackQuery = api.admin.feedback.useQuery({ page: 1, limit: 5 }, { retry: false })

  if (statsQuery.isError) {
    if (statsQuery.error.data?.code === 'UNAUTHORIZED') {
      window.location.href = '/admin/login'
      return null
    }
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-gray-950 mb-6">Dasbor Utama</h2>

      {statsQuery.isLoading && (
        <p className="text-gray-500 mb-6">Memuat statistik...</p>
      )}

      {statsQuery.data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`p-3 rounded-full mb-3 flex items-center justify-center ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statsQuery.data[card.key]}
                </div>
                <div className="text-xs font-semibold text-gray-500">{card.label}</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chats */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
              <MessageCircle className="w-4 h-4 text-[#CA8A04]" /> Chat Terbaru
            </h3>
            <Link href="/admin/chats" className="text-xs font-medium text-[#CA8A04] hover:text-[#b57c03] hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-5 flex-1">
            {recentChatsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Memuat...</p>
            ) : recentChatsQuery.data?.items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada chat.</p>
            ) : (
              <div className="space-y-4">
                {recentChatsQuery.data?.items.map(chat => (
                  <div key={chat.id} className="flex items-start justify-between gap-4 border-b border-gray-100/50 last:border-0 pb-4 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm text-gray-800 line-clamp-1">{chat.title}</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">{chat.user.name ?? chat.user.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(chat.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      </p>
                      <span className="text-[10px] font-semibold bg-[#CA8A04]/10 text-[#CA8A04] px-2.5 py-0.5 rounded-full inline-block mt-1 border border-[#CA8A04]/20">
                        {chat._count.messages} pesan
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
              <ThumbsUp className="w-4 h-4 text-emerald-500" /> Feedback Terbaru
            </h3>
            <Link href="/admin/feedback" className="text-xs font-medium text-[#CA8A04] hover:text-[#b57c03] hover:underline">Lihat Semua</Link>
          </div>
          <div className="p-5 flex-1">
            {recentFeedbackQuery.isLoading ? (
              <p className="text-sm text-gray-500">Memuat...</p>
            ) : recentFeedbackQuery.data?.items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada feedback.</p>
            ) : (
              <div className="space-y-4">
                {recentFeedbackQuery.data?.items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 border-b border-gray-100/50 last:border-0 pb-4 last:pb-0">
                    <div className="shrink-0 mt-0.5">
                      {item.rating === 'suka' ? (
                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 p-1.5 rounded-full"><ThumbsUp className="w-3.5 h-3.5" /></div>
                      ) : (
                        <div className="bg-rose-50 text-rose-700 border border-rose-100/50 p-1.5 rounded-full"><ThumbsDown className="w-3.5 h-3.5" /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-1.5">
                        <span className="font-bold text-gray-800">{item.user.name ?? item.user.email}</span> memberikan rating:
                      </p>
                      <p className="text-sm line-clamp-2 italic text-gray-600 bg-gray-50/50 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/50 leading-relaxed">
                        &quot;{item.message.chat.messages[0]?.content ?? '-'}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
