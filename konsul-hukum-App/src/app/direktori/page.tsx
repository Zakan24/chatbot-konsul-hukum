"use client"

import { useState } from "react"
import { api } from "nvn/trpc/react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { LogOut, Search, Filter, BookOpen, Scale, ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react"

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
import { PublicHeader } from "@/components/public-header"
import { BrandText } from "@/components/brand-text"

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
    <div className="flex h-screen flex-col font-sans selection:bg-accent/30 selection:text-primary">
      {/* Header */}
      {!session ? (
        <PublicHeader />
      ) : (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 md:px-8 py-4 transition-all">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo-header.png" alt="KH" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform" />
              <BrandText className="text-xl tracking-tight hidden sm:block" />
            </Link>

            <div className="flex items-center gap-4 md:gap-6">
              <Link
                href="/chat"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-accent transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali ke Chat</span>
              </Link>

              <div className="w-px h-6 bg-border/50 hidden sm:block"></div>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 cursor-pointer hover:bg-muted/50 border border-border/50 shadow-sm"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session?.user?.image ?? ""}
                        alt={session?.user?.name ?? "User"}
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                        {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border bg-card">
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none mt-1">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem className="cursor-pointer rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
        
        {/* Premium Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-16 md:py-24 flex items-center justify-center overflow-hidden shrink-0">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm mb-2 shadow-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Pusat Data Hukum
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Direktori Peraturan <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Indonesia</span>
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
              Eksplorasi arsip perundang-undangan nasional yang terintegrasi secara komprehensif.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
        </section>

        <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-16">
          
          {/* Search & Filter Container - Floating over content conceptually */}
          <div className="bg-card border border-border/60 shadow-lg shadow-primary/5 rounded-3xl p-6 md:p-8 mb-12 -mt-24 relative z-20">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Cari peraturan, pasal, atau topik hukum..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-inner"
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-14 px-8 rounded-2xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center whitespace-nowrap"
              >
                Cari Peraturan
              </button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2 hidden md:flex">
                <Filter className="w-4 h-4" /> Filter:
              </div>
              
              <div className="relative min-w-[180px] flex-1 sm:flex-none">
                <select
                  value={filterKategori}
                  onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
                  className="w-full h-11 rounded-xl border border-input bg-background px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-foreground cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">Semua Kategori</option>
                  {filterOptions?.kategori.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              <div className="relative min-w-[150px] flex-1 sm:flex-none">
                <select
                  value={filterTahun}
                  onChange={(e) => { setFilterTahun(e.target.value); setPage(1); }}
                  className="w-full h-11 rounded-xl border border-input bg-background px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-foreground cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">Semua Tahun</option>
                  {filterOptions?.tahun.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-11 rounded-xl px-4 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-medium ml-auto sm:ml-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-bold text-foreground">
              {peraturanQuery.isLoading
                ? "Memuat data peraturan..."
                : hasActiveFilters 
                  ? `Hasil Pencarian (${totalCount})` 
                  : `Total Peraturan (${totalCount})`}
            </h2>
          </div>

          {/* Peraturan List */}
          <div className="space-y-5">
            {peraturanList.map((item) => (
              <a
                key={item.id}
                href={item.url_bpk || "#"}
                target={item.url_bpk ? "_blank" : undefined}
                rel={item.url_bpk ? "noopener noreferrer" : undefined}
                className="group block rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 group-hover:bg-accent/10 transition-colors"></div>
                
                <div className="relative z-10">
                  {/* Title */}
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors text-lg md:text-xl pr-12">
                    {item.judul}
                  </h3>

                  {/* Sub Title */}
                  {item.sub_judul && (
                    <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                      {item.sub_judul}
                    </p>
                  )}

                  {/* Description (isi) */}
                  {item.isi && (
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-2 md:line-clamp-3 font-light">
                      {item.isi}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border/50 pt-5 flex flex-wrap items-center gap-3 text-xs">
                    {/* Year */}
                    {item.tahun && (
                      <span className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-full font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.tahun}
                      </span>
                    )}

                    {/* Kategori Hukum */}
                    {item.kategori_hukum && (
                      <span className="flex items-center gap-1.5 bg-accent/10 text-primary px-3 py-1.5 rounded-full font-medium border border-accent/20">
                        <Tag className="w-3.5 h-3.5" />
                        {item.kategori_hukum}
                      </span>
                    )}

                    {/* Tanggal Berlaku */}
                    {item.tanggal_berlaku && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-medium border border-emerald-500/20">
                        <Scale className="w-3.5 h-3.5" />
                        Berlaku: {item.tanggal_berlaku}
                      </span>
                    )}

                    {/* External link */}
                    {item.url_bpk && (
                      <span className="flex items-center gap-1.5 ml-auto text-muted-foreground group-hover:text-accent transition-colors font-semibold">
                        Lihat Sumber Asli
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Empty state */}
          {!peraturanQuery.isLoading && peraturanList.length === 0 && (
            <div className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Tidak ada peraturan ditemukan</h3>
              <p className="text-muted-foreground font-light mb-6">Coba gunakan kata kunci lain atau ubah filter pencarian Anda.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {getPageNumbers().map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground font-medium">
                        ...
                      </span>
                    )
                  }

                  const pageNum = p as number
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setPage(pageNum)}
                      className={`h-10 min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition-all cursor-pointer shadow-sm ${
                        pageNum === page
                          ? "bg-primary text-primary-foreground border-transparent shadow-md transform scale-105"
                          : "border border-border bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="hidden sm:inline">Selanjutnya</span> <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
