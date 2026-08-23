import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CreditCard,
  LogOut,
  TrendingUp,
  Clock,
  Layout,
  Megaphone,
  Home,
  Calendar,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: Home, color: "text-blue-600" },
  { href: "/admin/courses", label: "Manajemen Kelas", icon: BookOpen, color: "text-purple-600" },
  { href: "/admin/students", label: "Manajemen Siswa", icon: Users, color: "text-indigo-600" },
  { href: "/admin/transactions", label: "Transaksi", icon: CreditCard, color: "text-green-600" },
  { href: "/admin/events", label: "Live Events", icon: Calendar, color: "text-pink-600" },
  { href: "/admin/announcements", label: "Broadcast", icon: Megaphone, color: "text-orange-600" },
  { href: "/admin/sales-page", label: "Halaman Depan", icon: Layout, color: "text-teal-600" },
  { href: "/api/admin/export", label: "Export CSV", icon: TrendingUp, color: "text-emerald-600" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden lg:flex">
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
          <Link
            href="/api/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500
              hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          {/* Mobile menu toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-text-muted hover:text-primary flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Lihat Website
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">
              {session.user.name}
            </span>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {session.user.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}