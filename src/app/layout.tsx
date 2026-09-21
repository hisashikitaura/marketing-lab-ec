import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/Header";
import { CartProvider } from "@/components/CartProvider";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { UtmCapture } from "@/components/UtmCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketing Lab EC — マーケ学習ショップ",
  description:
    "マーケティングファネル・CVR・計測を学ぶためのデモECショップ（日本語）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
            Marketing Lab EC — 学習用デモショップ（Stripe TEST mode）
          </footer>
          <Suspense fallback={null}>
            <AnalyticsBeacon />
            <UtmCapture />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
