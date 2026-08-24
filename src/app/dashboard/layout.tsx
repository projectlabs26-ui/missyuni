export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  ShoppingCart,
  Trophy,
  User,
  LogOut,
  Menu,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/dashboard#catalog", label: "Katalog", icon: ShoppingCart },
  { href: "/dashboard#certificates", label: "Sertifikat", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <img src="/logomissyuni.png" alt="Missyuni" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-text text-sm">Missyuni</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-text-muted hover:text-primary hidden sm:block">
              Lihat Website
            </Link>
            <Link
              href="/api/logout"
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Keluar
            </Link>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {session.user.name?.charAt(0) || "S"}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pb-20 lg:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-xs font-medium text-text-muted
                hover:text-primary transition-colors px-2 py-1"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}