export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  Layout,
  Megaphone,
  Home,
  Calendar,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: Home, color: "text-blue-600" },
  { href: "/admin/courses", label: "Kelas", icon: BookOpen, color: "text-purple-600" },
  { href: "/admin/students", label: "Siswa", icon: Users, color: "text-indigo-600" },
  { href: "/admin/transactions", label: "Transaksi", icon: CreditCard, color: "text-green-600" },
  { href: "/admin/events", label: "Events", icon: Calendar, color: "text-pink-600" },
  { href: "/admin/announcements", label: "Broadcast", icon: Megaphone, color: "text-orange-600" },
  { href: "/admin/sales-page", label: "Sales Page", icon: Layout, color: "text-teal-600" },
  { href: "/api/admin/export", label: "Export CSV", icon: TrendingUp, color: "text-emerald-600" },
];

// Bottom nav: only important items for mobile
const bottomNavItems = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/courses", label: "Kelas", icon: BookOpen },
  { href: "/admin/transactions", label: "Transaksi", icon: CreditCard },
  { href: "/admin/students", label: "Siswa", icon: Users },
  { href: "/admin/announcements", label: "Broadcast", icon: Megaphone },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <img src="/logomissyuni.png" alt="Missyuni" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <p className="font-bold text-text text-sm">Missyuni</p>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted
                hover:bg-gray-50 hover:text-text transition-colors group"
            >
              <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3">
          <LogoutButton className="w-full" showLabel />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile: logo */}
            <img src="/logomissyuni.png" alt="Missyuni" className="w-7 h-7 rounded-lg object-contain lg:hidden" />
            <span className="font-bold text-sm text-text lg:hidden">Admin</span>
            {/* Desktop: back link */}
            <Link href="/" className="text-sm text-text-muted hover:text-primary hidden lg:flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Lihat Website
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted hidden sm:inline">
              {session.user.name}
            </span>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {session.user.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1.5 z-50 lg:hidden safe-area-pb">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-text-muted hover:text-primary transition-colors min-w-0"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium truncate">{item.label}</span>
          </Link>
        ))}
        <LogoutButton className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-red-400 hover:text-red-600" />
      </nav>
    </div>
  );
}
