"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { BrandText } from "@/components/brand-text";
import { useSession } from "next-auth/react";
import { Info, MessageCircle, BookOpen, ArrowLeft, Mail, MapPin, Send, Phone } from "lucide-react";

export default function ContactPage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-accent/30 selection:text-primary">
      {/* Header */}
      {!session ? (
        <PublicHeader />
      ) : (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 md:px-8 py-4 transition-all">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo-header.png" alt="KH" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform" />
              <BrandText className="text-xl tracking-tight" />
            </Link>
            <Link href="/chat" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-accent transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Chat</span>
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1 bg-background overflow-hidden">
        {/* Premium Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-24 md:py-32 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[150px] mix-blend-screen opacity-40"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm mb-2">
              Layanan Pelanggan
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Hubungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Kami</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto font-light leading-relaxed">
              Membutuhkan bantuan teknis, kemitraan, atau ingin memberikan umpan balik? Tim kami siap mendengarkan.
            </p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Contact Info Panel */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Informasi Kontak</h2>
                <p className="text-muted-foreground font-light">Hubungi kami melalui WhatsApp, email, atau kunjungi kantor kami untuk konsultasi lebih lanjut.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Phone className="w-6 h-6" />, label: "WhatsApp", value: "0813-1780-1888", link: "https://wa.me/6281317801888" },
                  { icon: <Mail className="w-6 h-6" />, label: "Email Resmi", value: "agussalimlawfirm76@gmail.com", link: "mailto:agussalimlawfirm76@gmail.com" },
                  { icon: <MapPin className="w-6 h-6" />, label: "Kantor Pusat", value: "Jl. Desa Keranggan Blok AA No.18, Kel. Kranggan, Kec. Setu, Kota Tangerang Selatan, Banten 15312", link: "https://www.google.com/maps/search/?api=1&query=Jl.+Desa+Keranggan+Blok+AA+No.18+Kel.+Kranggan+Kec.+Setu+Kota+Tangerang+Selatan+Banten+15312" },
                ].map((item, i) => (
                  <a 
                    key={i}
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-5 p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-accent transition-colors shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase opacity-70 mb-1">{item.label}</h3>
                      <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links Panel */}
            <div className="lg:col-span-7 bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Tautan Cepat</h2>
                  <p className="text-muted-foreground font-light">Akses langsung ke fitur utama aplikasi.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Info className="w-6 h-6" />, title: "Tentang Aplikasi", desc: "Pelajari visi dan arsitektur Konsul Hukum AI.", href: "/about" },
                    { icon: <MessageCircle className="w-6 h-6" />, title: "Mulai Konsultasi", desc: "Berinteraksi langsung dengan AI.", href: "/chat" },
                    { icon: <BookOpen className="w-6 h-6" />, title: "Direktori Peraturan", desc: "Jelajahi arsip perundang-undangan.", href: "/direktori" },
                  ].map((link, i) => (
                    <Link 
                      key={i} 
                      href={link.href} 
                      className={`group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all ${i === 2 ? 'sm:col-span-2' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-accent shadow-inner group-hover:-translate-y-1 transition-transform">
                          {link.icon}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowLeft className="w-4 h-4 rotate-135" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                      <p className="text-sm text-muted-foreground font-light">{link.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Elegant Footer */}
      <footer className="bg-primary text-primary-foreground/60 py-8 border-t border-accent/20">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-light">
          <div className="flex items-center gap-2">
            <img src="/logo-header.png" alt="KH" className="h-6 w-6 object-contain opacity-50 grayscale" />
            <span>© {new Date().getFullYear()} Konsul Hukum AI.</span>
          </div>
          <div>Hak Cipta Dilindungi Undang-Undang.</div>
        </div>
      </footer>
    </div>
  );
}
