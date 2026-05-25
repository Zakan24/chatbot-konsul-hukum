'use client'

import { useState } from 'react'
import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit3, Trash2, Calendar, BookOpen, Link2, Eye } from 'lucide-react'

type PeraturanForm = {
  id?: number
  judul: string
  sub_judul: string
  isi: string
  tanggal_ditetapkan: string
  tanggal_berlaku: string
  kategori_hukum: string
  url_bpk: string
  tahun: string
}

const emptyForm: PeraturanForm = {
  judul: '', sub_judul: '', isi: '', tanggal_ditetapkan: '', tanggal_berlaku: '', kategori_hukum: '', url_bpk: '', tahun: '',
}

export default function AdminPeraturanPage() {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PeraturanForm>(emptyForm)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const utils = api.useUtils()
  const query = api.admin.peraturanList.useQuery({ page, limit: 10 }, { retry: false })
  const data = query.data

  const upsertMutation = api.admin.peraturanUpsert.useMutation({
    onSuccess: () => {
      void utils.admin.peraturanList.invalidate()
      setShowForm(false)
      setForm(emptyForm)
    },
  })

  const deleteMutation = api.admin.peraturanDelete.useMutation({
    onSuccess: () => {
      void utils.admin.peraturanList.invalidate()
      setDeletingId(null)
    },
  })

  if (query.isError && query.error.data?.code === 'UNAUTHORIZED') {
    window.location.href = '/admin/login'
    return null
  }

  const handleEdit = (item: PeraturanForm & { id: number }) => {
    setForm(item)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    upsertMutation.mutate(form)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-950">Kelola Peraturan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola direktori peraturan dan hukum untuk RAG chatbot</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowForm(true) }}
          className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-gray-800 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peraturan</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <BookOpen className="w-5 h-5 text-[#1A1A1A]" />
              <h3 className="text-lg font-bold text-gray-900">{form.id ? 'Edit Peraturan' : 'Tambah Peraturan baru'}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div>
                <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Judul Peraturan</Label>
                <Input 
                  value={form.judul} 
                  onChange={e => setForm({ ...form, judul: e.target.value })} 
                  placeholder="e.g. Undang-Undang Nomor 7 Tahun 2021"
                  required 
                  className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                />
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Sub Judul / Tentang</Label>
                <Input 
                  value={form.sub_judul} 
                  onChange={e => setForm({ ...form, sub_judul: e.target.value })} 
                  placeholder="e.g. Harmonisasi Peraturan Perpajakan"
                  className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Kategori Hukum</Label>
                  <Input 
                    value={form.kategori_hukum} 
                    onChange={e => setForm({ ...form, kategori_hukum: e.target.value })} 
                    placeholder="e.g. Pajak / Pidana" 
                    className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Tahun</Label>
                  <Input 
                    value={form.tahun} 
                    onChange={e => setForm({ ...form, tahun: e.target.value })} 
                    placeholder="e.g. 2021"
                    className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Tanggal Ditetapkan</Label>
                  <Input 
                    value={form.tanggal_ditetapkan} 
                    onChange={e => setForm({ ...form, tanggal_ditetapkan: e.target.value })} 
                    placeholder="e.g. 29 Oktober 2021" 
                    className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Tanggal Berlaku</Label>
                  <Input 
                    value={form.tanggal_berlaku} 
                    onChange={e => setForm({ ...form, tanggal_berlaku: e.target.value })} 
                    placeholder="e.g. 29 Oktober 2021" 
                    className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Isi / Ringkasan Deskripsi</Label>
                <textarea
                  value={form.isi}
                  onChange={e => setForm({ ...form, isi: e.target.value })}
                  placeholder="Tuliskan intisari atau bunyi peraturan di sini..."
                  className="w-full rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-sm min-h-[90px] focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all custom-scrollbar leading-relaxed"
                />
              </div>
              
              <div>
                <Label className="text-gray-700 font-semibold text-xs mb-1.5 block">Tautan Dokumen BPK</Label>
                <Input 
                  value={form.url_bpk} 
                  onChange={e => setForm({ ...form, url_bpk: e.target.value })} 
                  placeholder="https://peraturan.bpk.go.id/..." 
                  className="rounded-xl border border-gray-200/80 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm h-10 px-3.5"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={upsertMutation.isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1A1A1A] hover:bg-gray-800 text-white transition shadow-sm cursor-pointer disabled:opacity-40"
                >
                  {upsertMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h4 className="font-bold text-gray-900 mb-2">Hapus Peraturan?</h4>
            <p className="text-sm text-gray-500 mb-5">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => setDeletingId(null)} 
                className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: deletingId })}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer disabled:opacity-40"
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Judul</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Sub Judul / Tentang</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Kategori</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Tahun</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {query.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Memuat data peraturan...
                  </td>
                </tr>
              )}
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/40 transition-colors duration-200">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800 max-w-[280px]">
                    <span className="line-clamp-1">{item.judul}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-[240px]">
                    <span className="line-clamp-1">{item.sub_judul || '-'}</span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100/30">
                      {item.kategori_hukum || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-500">{item.tahun || '-'}</td>
                  <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline text-xs cursor-pointer mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="text-rose-600 hover:text-rose-700 font-semibold hover:underline text-xs cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && !query.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 font-medium">
                    Belum ada peraturan terdaftar.
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
