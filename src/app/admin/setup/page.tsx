"use client";

import { useState } from "react";
import { BookOpen, Shield, Check, Loader2 } from "lucide-react";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Dewi Florenda",
          email: "dewiflorenda@gmail.com",
          password: "admin123",
          secret: "missyuni-admin-2024",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || "Gagal membuat admin");
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-text">Admin Setup</h1>
          <p className="text-text-muted mt-1">Buat akun admin Missyuni</p>
        </div>

        <div className="card p-6 md:p-8">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">Admin Berhasil Dibuat! 🎉</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p><span className="text-text-muted">Email:</span> <strong>dewiflorenda@gmail.com</strong></p>
                <p><span className="text-text-muted">Password:</span> <strong>admin123</strong></p>
              </div>
              <a
                href="/login"
                className="btn-primary inline-block mt-6"
              >
                Login Sekarang
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-text">Akun Admin</h3>
                </div>
                <div className="text-sm text-text-muted space-y-1">
                  <p>Email: <strong>dewiflorenda@gmail.com</strong></p>
                  <p>Password: <strong>admin123</strong></p>
                  <p>Role: <strong>admin</strong></p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
              )}

              <button
                onClick={handleSetup}
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Buat Akun Admin
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
