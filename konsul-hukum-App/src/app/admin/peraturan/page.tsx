'use client'

import { useState } from 'react'
import { api } from 'nvn/trpc/react'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Kelola Peraturan</h2>
        <Button
          onClick={() => { setForm(emptyForm); setShowForm(true) }}
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 cursor-pointer"
        >
          + Tambah Peraturan
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{form.id ? 'Edit Peraturan' : 'Tambah Peraturan'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Judul</Label>
                <Input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required />
              </div>
              <div>
                <Label>Sub Judul</Label>
                <Input value={form.sub_judul} onChange={e => setForm({ ...form, sub_judul: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kategori Hukum</Label>
                  <Input value={form.kategori_hukum} onChange={e => setForm({ ...form, kategori_hukum: e.target.value })} placeholder="Pidana / Perdata" />
                </div>
                <div>
                  <Label>Tahun</Label>
                  <Input value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tanggal Ditetapkan</Label>
                  <Input value={form.tanggal_ditetapkan} onChange={e => setForm({ ...form, tanggal_ditetapkan: e.target.value })} placeholder="01 Januari 2026" />
                </div>
                <div>
                  <Label>Tanggal Berlaku</Label>
                  <Input value={form.tanggal_berlaku} onChange={e => setForm({ ...form, tanggal_berlaku: e.target.value })} placeholder="01 Januari 2026" />
                </div>
              </div>
              <div>
                <Label>Isi / Deskripsi</Label>
                <textarea
                  value={form.isi}
                  onChange={e => setForm({ ...form, isi: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <Label>URL BPK</Label>
                <Input value={form.url_bpk} onChange={e => setForm({ ...form, url_bpk: e.target.value })} placeholder="https://peraturan.bpk.go.id/..." />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="cursor-pointer">
                  Batal
                </Button>
                <Button type="submit" disabled={upsertMutation.isPending}
                  className="bg-primary text-primary-foreground cursor-pointer">
                  {upsertMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm text-center">
            <p className="text-sm mb-4">Yakin ingin menghapus peraturan ini?</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={() => setDeletingId(null)} className="cursor-pointer">Batal</Button>
              <Button
                onClick={() => deleteMutation.mutate({ id: deletingId })}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground cursor-pointer"
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Judul</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sub Judul</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tahun</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat data...</td></tr>
              )}
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium max-w-[250px]">
                    <span className="line-clamp-1">{item.judul}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px]">
                    <span className="line-clamp-1">{item.sub_judul}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                      {item.kategori_hukum || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{item.tahun}</td>
                  <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary hover:underline text-xs cursor-pointer mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="text-destructive hover:underline text-xs cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada peraturan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 cursor-pointer hover:bg-muted transition-colors">
            ← Sebelumnya
          </button>
          <span className="text-sm text-muted-foreground">Hal {page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 cursor-pointer hover:bg-muted transition-colors">
            Selanjutnya →
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
