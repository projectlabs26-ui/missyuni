"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container-custom flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <img src="/logomissyuni.png" alt="Missyuni" className="w-8 h-8 rounded-lg object-contain" />
          <span>Missyuni</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#courses" className="text-text-muted hover:text-primary transition-colors">
            Kelas
          </Link>
          <Link href="/#testimonials" className="text-text-muted hover:text-primary transition-colors">
            Testimoni
          </Link>
          <Link href="/#about" className="text-text-muted hover:text-primary transition-colors">
            Tentang
          </Link>
          <Link href="/login" className="btn-outline text-sm py-2 px-4">
            Masuk
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Daftar
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-text-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container-custom py-4 flex flex-col gap-3">
            <Link href="/#courses" className="text-text-muted py-2" onClick={() => setOpen(false)}>
              Kelas
            </Link>
            <Link href="/#testimonials" className="text-text-muted py-2" onClick={() => setOpen(false)}>
              Testimoni
            </Link>
            <Link href="/#about" className="text-text-muted py-2" onClick={() => setOpen(false)}>
              Tentang
            </Link>
            <Link href="/login" className="btn-outline text-center text-sm py-2">
              Masuk
            </Link>
            <Link href="/register" className="btn-primary text-center text-sm py-2">
              Daftar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}