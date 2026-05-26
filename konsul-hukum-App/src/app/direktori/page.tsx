"use client"

import { useState } from "react"
import { api } from "nvn/trpc/react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DirektoriPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [filterKategori, setFilterKategori] = useState("")
  const [filterTahun, setFilterTahun] = useState("")

  const [page, setPage] = useState(1)

  const filterOptionsQuery = api.peraturan.filterOptions.useQuery()

  const peraturanQuery = api.peraturan.list.useQuery({
    search: search || undefined,
    kategori: filterKategori || undefined,
    tahun: filterTahun || undefined,
    page,
    limit: 10,
  })

  const peraturanList = peraturanQuery.data?.items ?? []
  const totalCount = peraturanQuery.data?.totalCount ?? 0
  const totalPages = peraturanQuery.data?.totalPages ?? 1
  const filterOptions = filterOptionsQuery.data

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" })
  }

  const clearFilters = () => {
    setSearch("")
    setSearchInput("")
    setFilterKategori("")
    setFilterTahun("")
    setPage(1)
  }

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (page <= 3) {
      return [1, 2, 3, "...", totalPages]
    }

    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages]
  }

  const hasActiveFilters = search || filterKategori || filterTahun

  return (
    <div className="flex h-screen flex-col bg-transparent">
      {/* Header */}
      <header className="bg-transparent px-4 md:px-8 lg:px-24 py-4 shrink-0 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md overflow-hidden bg-white border border-gray-100 shadow-sm">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <h1 className="text-lg font-bold hidden sm:block text-white">Konsul Hukum</h1>
            </Link>
          </div>

          {/* Back Button */}
          <div className="flex items-center">
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/60 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Kembali ke Chat
            </Link>
          </div>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 cursor-pointer hover:bg-white/40"
              >
                <Avatar className="h-10 w-10 border border-white/60 shadow-sm">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback className="bg-[#6B0B0C]/10 text-[#6B0B0C] font-semibold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-white/60 bg-white/90 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-gray-500 text-xs leading-none mt-1">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem className="cursor-pointer rounded-xl text-red-600 focus:bg-red-50 focus:text-red-700" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari peraturan, pasal, atau topik hukum..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full h-14 pl-12 pr-4 rounded-full border border-white/60 bg-white/80 backdrop-blur-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/20 focus:border-[#CA8A04]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-full px-6 md:px-8 py-3 text-sm font-medium text-white transition-all cursor-pointer hover:opacity-90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#6B0B0C' }}
            >
              Cari
            </button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <select
              value={filterKategori}
              onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
              className="h-10 rounded-full border border-white/60 bg-white/60 backdrop-blur-md px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/20 shadow-sm transition-all text-gray-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em]"
            >
              <option value="">Semua Kategori</option>
              {filterOptions?.kategori.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            <select
              value={filterTahun}
              onChange={(e) => { setFilterTahun(e.target.value); setPage(1); }}
              className="h-10 rounded-full border border-white/60 bg-white/60 backdrop-blur-md px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/20 shadow-sm transition-all text-gray-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em]"
            >
              <option value="">Semua Tahun</option>
              {filterOptions?.tahun.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-10 rounded-full px-4 text-sm text-gray-500 hover:text-gray-900 hover:bg-white/40 transition-colors cursor-pointer font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/80 font-medium">
              {peraturanQuery.isLoading
                ? "Memuat data peraturan..."
                : `Menampilkan ${peraturanList.length} dari ${totalCount} Peraturan`}
            </p>
          </div>

          {/* Peraturan List */}
          <div className="space-y-4">
            {peraturanList.map((item) => (
              <a
                key={item.id}
                href={item.url_bpk || "#"}
                target={item.url_bpk ? "_blank" : undefined}
                rel={item.url_bpk ? "noopener noreferrer" : undefined}
                className="group block rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-5 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#CA8A04]/40 transition-all duration-300"
              >
                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#6B0B0C] transition-colors text-base md:text-lg">
                  {item.judul}
                </h3>

                {/* Sub Title */}
                {item.sub_judul && (
                  <p className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                    {item.sub_judul}
                  </p>
                )}

                {/* Description (isi) */}
                {item.isi && (
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed line-clamp-2 md:line-clamp-3">
                    {item.isi}
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100/80 pt-4 flex flex-wrap items-center gap-3 text-xs">
                  {/* Year */}
                  {item.tahun && (
                    <span className="flex items-center gap-1.5 bg-gray-100/80 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      {item.tahun}
                    </span>
                  )}

                  {/* Kategori Hukum */}
                  {item.kategori_hukum && (
                    <span className="flex items-center gap-1.5 bg-[#CA8A04]/10 text-[#CA8A04] px-3 py-1.5 rounded-full font-medium border border-[#CA8A04]/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {item.kategori_hukum}
                    </span>
                  )}

                  {/* Tanggal Berlaku */}
                  {item.tanggal_berlaku && (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium border border-emerald-100/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Berlaku: {item.tanggal_berlaku}
                    </span>
                  )}

                  {/* External link */}
                  {item.url_bpk && (
                    <span className="flex items-center gap-1.5 ml-auto group-hover:text-[#6B0B0C] transition-colors font-medium">
                      Lihat di BPK
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Empty state */}
          {!peraturanQuery.isLoading && peraturanList.length === 0 && (
            <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <p className="text-gray-500 font-medium mb-2">Tidak ada peraturan ditemukan.</p>
              <button
                onClick={clearFilters}
                className="text-sm text-[#CA8A04] hover:text-[#b57c03] hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pb-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:text-gray-400 flex items-center justify-center"
              >
                ← Sebelumnya
              </button>

              {getPageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-medium">
                      ...
                    </span>
                  )
                }

                const pageNum = p as number
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 min-w-9 rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer shadow-sm ${
                      pageNum === page
                        ? "bg-[#6B0B0C] text-white border border-[#6B0B0C]"
                        : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:text-gray-400 flex items-center justify-center"
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
