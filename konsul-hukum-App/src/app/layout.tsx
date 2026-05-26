import "nvn/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Konsul Hukum - Asisten AI Hukum",
  description: "Chatbot AI untuk konsultasi hukum Indonesia",
  icons: [{ rel: "icon", url: "/favicon.png", type: "image/png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-gradient-to-br from-[#FAF5E6] via-[#FCEEE7] to-[#F5EAD4]" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
