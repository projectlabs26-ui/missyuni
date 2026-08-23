import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SWRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NotificationPermission } from "@/components/pwa/notification-permission";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Missyuni - Belajar Bahasa Inggris Online",
  description:
    "Platform belajar Bahasa Inggris online bersama Miss Yuni. Kursus interaktif, video, kuis, dan sertifikat digital. Khusus SMA/SMK dan pembelajar umum.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Missyuni",
  },
  icons: {
    icon: "/logomissyuni.png",
    apple: "/logomissyuni.png",
  },
  keywords: [
    "belajar bahasa inggris",
    "kursus bahasa inggris",
    "missyuni",
    "english course",
    "sma",
    "smk",
    "pwa",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/logomissyuni.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white" suppressHydrationWarning>
        {children}
        <Toaster />
        <SWRegister />
        <InstallPrompt />
        <NotificationPermission />
      </body>
    </html>
  );
}