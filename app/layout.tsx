import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmanKampus - Platform Keamanan & Pelaporan Anonim Kampus",
  description: "Sistem pelaporan terenkripsi end-to-end untuk menciptakan lingkungan kampus yang aman, inklusif, dan bebas perundungan.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";
import PageBackdrop from "@/components/PageBackdrop";
import IntroAnimation from "@/components/IntroAnimation";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#ececec] text-teal-950 dark:bg-[#0c2b29] dark:text-stone-100 relative" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <IntroAnimation />
          <PageBackdrop />

          <Navbar />
          <CommandPalette />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
