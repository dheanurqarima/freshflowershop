import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";

const geist = localFont({
  src: [
    { path: '../public/fonts/Geist-Regular.woff2', weight: '400' },
    { path: '../public/fonts/Geist-Medium.woff2', weight: '500' },
    { path: '../public/fonts/Geist-Bold.woff2', weight: '700' },
  ],
  variable: '--font-geist',
})

const geistMono = localFont({
  src: '../public/fonts/GeistMono-Regular.woff2',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: "Fresh Flower Shop - Toko Bunga Terbaik",
  description: "Temukan bunga terindah untuk setiap momen spesial. Kualitas terbaik dengan harga terjangkau!",
  keywords: ["bunga", "flower shop", "toko bunga", "rangkaian bunga", "bouquet"],
  authors: [{ name: "Fresh Flower Shop" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
