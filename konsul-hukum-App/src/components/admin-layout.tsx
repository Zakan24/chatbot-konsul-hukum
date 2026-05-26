"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { api } from "nvn/trpc/react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Pengguna", href: "/admin/users" },
  { label: "Chat", href: "/admin/chats" },
  { label: "Feedback", href: "/admin/feedback" },
  { label: "Laporan", href: "/admin/laporan" },
  { label: "Peraturan", href: "/admin/peraturan" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const logoutMutation = api.admin.logout.useMutation({
    onSuccess: () => {
      document.cookie = "admin_session=; path=/; max-age=0";
      window.location.href = "/admin/login"
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-transparent border-b border-white/20 px-4 md:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md overflow-hidden bg-white border border-gray-100 shadow-sm">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <h1 className="text-lg font-bold hidden sm:block text-[#6B0B0C]">Admin Panel</h1>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#6B0B0C] text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900 bg-white/60 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/60 backdrop-blur-md shadow-sm border border-white/50 hover:bg-white transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#6B0B0C] text-white shadow-sm"
                    : "text-gray-700 bg-white/60 backdrop-blur-md border border-white/50 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 bg-transparent p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
