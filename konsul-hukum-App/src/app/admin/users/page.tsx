'use client'

import { useState } from 'react'
import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const query = api.admin.users.useQuery({ page, limit: 10 }, { retry: false })
  const data = query.data

  if (query.isError && query.error.data?.code === 'UNAUTHORIZED') {
    window.location.href = '/admin/login'
    return null
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-950">Daftar Pengguna</h2>
        <p className="text-sm text-gray-500 mt-1">Daftar akun pengguna yang terdaftar di aplikasi Konsul Hukum</p>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Nama</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Chat</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Memuat data pengguna...
                  </td>
                </tr>
              )}
              {data?.items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                    <div className="flex items-center gap-2.5">
                      {user.image ? (
                        <img src={user.image} alt="" className="h-7 w-7 rounded-full border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <span className="font-semibold text-gray-800">{user.name ?? '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-medium">{user.email ?? '-'}</td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100/30">
                      {user._count.chats} chat
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/30">
                      {user._count.feedbacks} feedback
                    </span>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Belum ada pengguna terdaftar.
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
