"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicHeader } from "@/components/public-header";
import { BrandText } from "@/components/brand-text";
import { useSession } from "next-auth/react";
import { MessageCircle, Scale, BookOpen, ArrowLeft, ChevronDown } from "lucide-react";

export default function AboutPage() {
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Apa itu Konsul Hukum AI?",
      a: "Konsul Hukum AI adalah aplikasi chatbot AI eksklusif yang dirancang untuk memberikan pemahaman mendalam tentang regulasi dan perundang-undangan di Indonesia, didukung oleh kecerdasan buatan dengan referensi presisi ke sumber hukum resmi.",
    },
    {
      q: "Apakah jawaban dari Konsul Hukum AI bisa dijadikan dasar hukum di pengadilan?",
      a: "Konsul Hukum AI berfungsi sebagai asisten analitis dan edukatif. Layanan ini bukan pengganti opini legal dari advokat bersertifikat. Selalu konsultasikan dengan penasihat hukum profesional untuk pengambilan keputusan strategis atau litigasi.",
    },
    {
      q: "Bagaimana cara menggunakan Konsul Hukum AI?",
      a: "Sampaikan pertanyaan spesifik Anda di antarmuka chat kami, dan AI akan menganalisis serta menyajikan jawaban komprehensif lengkap dengan sitasi pasal relevan. Tersedia akses uji coba bagi tamu, dan fitur penuh untuk pengguna terdaftar.",
    },
    {
      q: "Berapa biaya menggunakan Konsul Hukum AI?",
      a: "Saat ini, akses ke Konsul Hukum AI disediakan secara gratis dengan sistem alokasi kredit untuk menjaga kualitas performa. Setiap analisis pertanyaan akan mengonsumsi satu kredit.",
    },
    {
      q: "Apakah data percakapan saya aman?",
      a: "Privasi Anda adalah prioritas absolut kami. Enkripsi tingkat lanjut memastikan bahwa riwayat percakapan sepenuhnya rahasia dan hanya dapat diakses melalui kredensial pribadi Anda.",
    },
  ];

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
        <section className="relative bg-primary text-primary-foreground py-24 md:py-32 lg:py-40 flex items-center justify-center overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[150px] mix-blend-screen opacity-40"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-ping"></span>
              Kecerdasan Buatan Hukum
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
              Navigasi Hukum <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Tanpa Batas</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
              Asisten AI komprehensif dengan presisi analitik. Didukung oleh teknologi mutakhir yang di-grounding langsung pada perundang-undangan resmi Indonesia.
            </p>
          </div>
          
          {/* Decorative Bottom Wave/Border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-20 space-y-32">
          
          {/* Latar Belakang - Elegant Prose */}
          <section className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-tr from-primary to-primary/80 p-1 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <Scale className="w-32 h-32 text-accent opacity-90 drop-shadow-lg" strokeWidth={1} />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/30 blur-[50px] rounded-full"></div>
              </div>
            </div>
            <div className="md:col-span-7 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <span className="w-8 h-1 bg-accent rounded-full"></span>
                Latar Belakang
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed space-y-6 font-light">
                <p>
                  Konsul Hukum AI dikonseptualisasikan untuk merespons kompleksitas literasi hukum di Indonesia. Kami menyadari bahwa arsitektur bahasa perundang-undangan sering kali menjadi penghalang bagi masyarakat umum untuk memahami hak dan kewajiban mereka.
                </p>
                <p>
                  Melalui implementasi teknologi <strong className="text-foreground font-medium">Retrieval-Augmented Generation (RAG)</strong> tingkat lanjut, aplikasi ini menyaring dan memformulasikan jawaban akurat dengan rujukan definitif. Kami menjembatani kesenjangan informasi dengan keanggunan teknologi.
                </p>
              </div>
            </div>
          </section>

          {/* Fitur - Premium Cards */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Keunggulan Sistem</h2>
              <p className="text-muted-foreground font-light max-w-xl mx-auto">Arsitektur fitur yang dirancang khusus untuk memberikan pengalaman konsultasi yang mulus dan dapat diandalkan.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <MessageCircle className="h-8 w-8" />, title: "Konsultasi AI Dinamis", desc: "Dialog interaktif cerdas yang merespons secara kontekstual terhadap setiap nuansa pertanyaan hukum Anda." },
                { icon: <Scale className="h-8 w-8" />, title: "Sitasi Hukum Presisi", desc: "Setiap analisis yang diberikan dilengkapi dengan rujukan pasal aktual dari pangkalan data resmi." },
                { icon: <BookOpen className="h-8 w-8" />, title: "Direktori Terintegrasi", desc: "Akses sentralistik ke arsip perundang-undangan nasional dengan antarmuka pencarian yang intuitif." },
              ].map((f, i) => (
                <div key={i} className="group relative rounded-2xl bg-card border border-border/50 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors"></div>
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-accent shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Teknologi - Sleek Pills */}
          <section className="bg-primary/5 rounded-3xl p-10 md:p-16 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Infrastruktur Teknologi</h2>
                <p className="text-muted-foreground font-light">Dibangun di atas tumpukan teknologi modern yang tangguh.</p>
              </div>
              <div className="flex flex-wrap gap-3 max-w-lg justify-start md:justify-end">
                {["Next.js", "tRPC", "Prisma", "PostgreSQL", "Google Vertex AI", "TailwindCSS"].map((tech) => (
                  <span key={tech} className="rounded-full bg-background border border-border/50 px-5 py-2 text-sm font-medium text-foreground shadow-sm hover:border-accent/50 hover:text-accent transition-colors cursor-default">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ - Minimalist Accordion */}
          <section className="max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Pertanyaan Umum</h2>
              <p className="text-muted-foreground font-light">Informasi komprehensif seputar layanan kami.</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="group border border-border/60 rounded-2xl bg-card hover:border-accent/30 transition-colors overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer outline-none"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-foreground pr-8">{faq.q}</span>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary/5 text-primary transition-transform duration-300 ${openFaq === i ? "rotate-180 bg-accent/20 text-accent" : ""}`}>
                      <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                  </button>
                  <div 
                    className={`px-6 text-muted-foreground font-light leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pt-2 border-t border-border/30 mt-2">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
