"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast("Password dan konfirmasi tidak cocok", "error");
      return;
    }
    if (password.length < 6) {
      toast("Password minimal 6 karakter", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Set cookie via JavaScript
        const sessionData = JSON.stringify(data.user);
        document.cookie = `session=${encodeURIComponent(sessionData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        toast("Pendaftaran berhasil!", "success");
        window.location.href = data.redirectPath || "/dashboard";
      } else {
        toast(data.error || "Gagal mendaftar", "error");
      }
    } catch {
      toast("Gagal mendaftar. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-2xl text-primary">
            <img src="/logomissyuni.png" alt="Missyuni" className="w-12 h-12 rounded-xl" />
            <span>Missyuni</span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Buat akun baru</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-text mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama kamu"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* WhatsApp */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-text mb-1">
                WhatsApp <span className="text-text-muted font-normal">(opsional)</span>
              </label>
              <input
                type="tel"
                placeholder="0812-3456-7890"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                autoComplete="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-text mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text mb-1">Konfirmasi Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Ulangi password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-5">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
