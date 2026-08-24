"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><p>Memuat...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const loginError = searchParams.get("error");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Email atau password salah");
        setLoading(false);
        return;
      }

      // Set cookie via JavaScript — this ALWAYS works
      const sessionData = JSON.stringify(data.user);
      document.cookie = `session=${encodeURIComponent(sessionData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // Navigate after cookie is set
      window.location.href = data.redirectPath || "/dashboard";
    } catch {
      setError("Gagal terhubung ke server");
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
          <p className="text-text-muted text-sm mt-2">Masuk ke akun kamu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {(loginError || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error || "Email atau password salah"}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-text mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !mounted}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
            >
              {!mounted ? "Memuat..." : loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-5">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
