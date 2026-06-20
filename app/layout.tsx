import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suertetranslations.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Suerte Translations",
    template: "%s | Suerte Translations",
  },
  description:
    "Premium web novel translations. Read the latest chapters of your favorite light novels and web novels.",
  keywords: ["web novel", "light novel", "translation", "manga", "chinese novel", "korean novel"],
  authors: [{ name: "Suerte Translations" }],
  openGraph: {
    type: "website",
    siteName: "Suerte Translations",
    title: "Suerte Translations",
    description: "Premium web novel translations. Read the latest chapters of your favorite light novels and web novels.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Suerte Translations",
    description: "Premium web novel translations. Read the latest chapters of your favorite light novels and web novels.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
