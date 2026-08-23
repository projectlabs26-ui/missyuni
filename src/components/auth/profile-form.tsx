"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import type { User } from "@/types";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    whatsapp: user.whatsapp || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast("Profil berhasil diperbarui!", "success");
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error || "Gagal update profil", "error");
      }
    } catch {
      toast("Gagal update profil", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Nama</label>
        <input
          type="text"
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Email</label>
        <input type="email" className="input-field bg-gray-50" value={user.email} disabled />
        <p className="text-xs text-text-muted mt-1">Email tidak dapat diubah.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">WhatsApp</label>
        <input
          type="tel"
          className="input-field"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          placeholder="0812-3456-7890"
        />
      </div>

      <hr className="border-gray-200" />
      <p className="text-sm font-medium text-text">Ganti Password (opsional)</p>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Password Saat Ini</label>
        <input
          type="password"
          className="input-field"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Password Baru</label>
        <input
          type="password"
          className="input-field"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}