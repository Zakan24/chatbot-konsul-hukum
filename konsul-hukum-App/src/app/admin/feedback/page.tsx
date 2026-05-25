'use client'

import { useState } from 'react'
import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'
import { ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react'

export default function AdminFeedbackPage() {
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<'suka' | 'tidak_suka' | undefined>(undefined)

  const query = api.admin.feedback.useQuery(
    { page, limit: 10, rating: ratingFilter },
    { retry: false }
  )
  const data = query.data

  if (query.isError && query.error.data?.code === 'UNAUTHORIZED') {
    window.location.href = '/admin/login'
    return null
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-950">Ulasan & Balasan</h2>
          <p className="text-sm text-gray-500 mt-1">Daftar feedback Like/Dislike dari pengguna terhadap respons AI</p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {(['all', 'suka', 'tidak_suka'] as const).map((val) => {
            const isActive = val === 'all' ? !ratingFilter : ratingFilter === val
            return (
              <button
                key={val}
                onClick={() => { setRatingFilter(val === 'all' ? undefined : val); setPage(1) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white'
                    : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {val === 'all' ? 'Semua' : val === 'suka' ? <><ThumbsUp className="w-3.5 h-3.5" /> Suka</> : <><ThumbsDown className="w-3.5 h-3.5" /> Tidak Suka</>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 w-[120px]">Rating</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 max-w-[200px]">Pertanyaan Pengguna</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 max-w-[300px]">Jawaban Asisten AI</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Pengguna</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Memuat data feedback...
                  </td>
                </tr>
              )}
              {data?.items.map((item) => {
                const userQuestion = item.message.chat.messages[0]?.content ?? '-'
                const aiAnswer = item.message.content
                return (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.rating === 'suka'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                          : 'bg-rose-50 text-rose-700 border-rose-100/50'
                      }`}>
                        {item.rating === 'suka' ? (
                          <><ThumbsUp className="w-2.5 h-2.5" /> Suka</>
                        ) : (
                          <><ThumbsDown className="w-2.5 h-2.5" /> Tidak Suka</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed">{userQuestion}</p>
                    </td>
                    <td className="px-5 py-4 max-w-[300px]">
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{aiAnswer}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.user.name ?? item.user.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {data?.items.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Belum ada ulasan terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
