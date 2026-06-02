"use client"

import { useState } from "react"
import { api } from "nvn/trpc/react"
import { AdminLayout } from "@/components/admin-layout"
import { Settings, Users, AlertCircle, Edit2, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react"

export default function AdminQuotaPage() {
  const [activeTab, setActiveTab] = useState<"config" | "users">("config")
  const [page, setPage] = useState(1)
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [editingConfig, setEditingConfig] = useState(false)
  
  // Config form state
  const [configForm, setConfigForm] = useState({
    defaultCredits: 20,
    guestMessageLimit: 1,
    spamTimeWindowSec: 30,
    minMessageLength: 10,
  })

  // User edit state
  const [editingUser, setEditingUser] = useState<{ id: string; credits: number; name: string } | null>(null)

  const utils = api.useUtils()

  // Queries
  const configQuery = api.admin.quotaConfig.useQuery(undefined, {
    onSuccess: (data) => {
      if (!editingConfig && data) {
        setConfigForm({
          defaultCredits: data.defaultCredits,
          guestMessageLimit: data.guestMessageLimit,
          spamTimeWindowSec: data.spamTimeWindowSec,
          minMessageLength: data.minMessageLength,
        })
      }
    }
  })

  const usersQuery = api.admin.userCredits.useQuery({
    page,
    limit: 10,
    flaggedOnly,
  }, {
    enabled: activeTab === "users"
  })

  // Mutations
  const updateConfigMutation = api.admin.updateQuotaConfig.useMutation({
    onSuccess: () => {
      setEditingConfig(false)
      void utils.admin.quotaConfig.invalidate()
    }
  })

  const adjustCreditsMutation = api.admin.adjustUserCredits.useMutation({
    onSuccess: () => {
      setEditingUser(null)
      void utils.admin.userCredits.invalidate()
    }
  })

  const toggleFlagMutation = api.admin.toggleUserFlag.useMutation({
    onSuccess: () => void utils.admin.userCredits.invalidate()
  })

  const resetQuotaMutation = api.admin.resetUserQuota.useMutation({
    onSuccess: () => void utils.admin.userCredits.invalidate()
  })

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#6B0B0C]" />
            Manajemen Quota & Kredit
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Atur limit pesan guest, biaya spam, dan kredit pengguna.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("config")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "config" ? "text-[#6B0B0C]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Konfigurasi Global
          {activeTab === "config" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B0B0C] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "users" ? "text-[#6B0B0C]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Kredit Pengguna
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B0B0C] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab: Config */}
      {activeTab === "config" && (
        <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {configQuery.isLoading ? (
            <p className="text-sm text-gray-500">Memuat konfigurasi...</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kredit Awal Default
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Jumlah kredit untuk pengguna baru.</p>
                  <input
                    type="number"
                    value={configForm.defaultCredits}
                    onChange={(e) => setConfigForm({ ...configForm, defaultCredits: parseInt(e.target.value) || 0 })}
                    disabled={!editingConfig}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Pesan Guest
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Pesan gratis sebelum wajib login.</p>
                  <input
                    type="number"
                    value={configForm.guestMessageLimit}
                    onChange={(e) => setConfigForm({ ...configForm, guestMessageLimit: parseInt(e.target.value) || 0 })}
                    disabled={!editingConfig}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Spam (Detik)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Jeda antar pesan sebelum dianggap spam.</p>
                  <input
                    type="number"
                    value={configForm.spamTimeWindowSec}
                    onChange={(e) => setConfigForm({ ...configForm, spamTimeWindowSec: parseInt(e.target.value) || 0 })}
                    disabled={!editingConfig}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Panjang Minimal Pesan
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Pesan di bawah ini dianggap spam.</p>
                  <input
                    type="number"
                    value={configForm.minMessageLength}
                    onChange={(e) => setConfigForm({ ...configForm, minMessageLength: parseInt(e.target.value) || 0 })}
                    disabled={!editingConfig}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {editingConfig ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingConfig(false)
                        if (configQuery.data) {
                          setConfigForm({
                            defaultCredits: configQuery.data.defaultCredits,
                            guestMessageLimit: configQuery.data.guestMessageLimit,
                            spamTimeWindowSec: configQuery.data.spamTimeWindowSec,
                            minMessageLength: configQuery.data.minMessageLength,
                          })
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => updateConfigMutation.mutate(configForm)}
                      disabled={updateConfigMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#6B0B0C] hover:bg-[#520809] rounded-full shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {updateConfigMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingConfig(true)}
                    className="px-4 py-2 text-sm font-medium text-[#6B0B0C] bg-[#6B0B0C]/10 hover:bg-[#6B0B0C]/20 rounded-full transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Ubah Konfigurasi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setFlaggedOnly(!flaggedOnly); setPage(1); }}
              className={`text-sm px-4 py-2 rounded-full border transition-colors cursor-pointer ${
                flaggedOnly 
                  ? "bg-rose-50 border-rose-200 text-rose-700" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Hanya Tampilkan Flagged
              </span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Pengguna</th>
                    <th className="px-6 py-4 font-medium">Kredit</th>
                    <th className="px-6 py-4 font-medium">Biaya/Msg</th>
                    <th className="px-6 py-4 font-medium">Spam Streak</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersQuery.isLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
                  ) : usersQuery.data?.items.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada pengguna ditemukan.</td></tr>
                  ) : (
                    usersQuery.data?.items.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{user.name || "User"}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          {user.isFlagged && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700">
                              <ShieldAlert className="h-3 w-3" /> Flagged
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingUser?.id === user.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-20 h-8 px-2 border rounded text-sm"
                                value={editingUser.credits}
                                onChange={(e) => setEditingUser({ ...editingUser, credits: parseInt(e.target.value) || 0 })}
                              />
                              <button
                                onClick={() => adjustCreditsMutation.mutate({ userId: user.id, credits: editingUser.credits })}
                                className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                disabled={adjustCreditsMutation.isPending}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className={`font-semibold ${user.credits < 5 ? "text-rose-600" : "text-gray-900"}`}>
                                {user.credits}
                              </span>
                              <button
                                onClick={() => setEditingUser({ id: user.id, credits: user.credits, name: user.name || "User" })}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#CA8A04] transition-opacity cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={user.creditCostPerMsg > 1 ? "text-rose-600 font-medium" : "text-gray-600"}>
                            {user.creditCostPerMsg}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={user.spamStreak > 0 ? "text-amber-600 font-medium" : "text-gray-400"}>
                            {user.spamStreak}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              title="Reset Quota"
                              onClick={() => {
                                if (confirm(`Reset kuota untuk ${user.name}?`)) {
                                  resetQuotaMutation.mutate({ userId: user.id })
                                }
                              }}
                              disabled={resetQuotaMutation.isPending}
                              className="p-1.5 text-gray-400 hover:text-[#6B0B0C] hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              title={user.isFlagged ? "Unflag User" : "Flag User (Force 3x Cost)"}
                              onClick={() => toggleFlagMutation.mutate({ userId: user.id })}
                              disabled={toggleFlagMutation.isPending}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                user.isFlagged 
                                  ? "text-rose-600 bg-rose-50 hover:bg-rose-100" 
                                  : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                            >
                              {user.isFlagged ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {usersQuery.data && usersQuery.data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Halaman {page} dari {usersQuery.data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Mundur
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(usersQuery.data.totalPages, p + 1))}
                    disabled={page === usersQuery.data.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Maju
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
