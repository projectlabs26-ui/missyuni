"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    isPublished: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      });

      if (res.ok) {
        toast("Kelas berhasil dibuat!", "success");
        router.push("/admin/courses");
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error || "Gagal membuat kelas", "error");
      }
    } catch {
      toast("Gagal membuat kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div>
      <a href="/admin/courses" className="text-text-muted hover:text-primary mb-4 inline-block">
        ← Kembali
      </a>
      <h1 className="text-2xl font-bold text-text mb-8">Tambah Kelas Baru</h1>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Judul Kelas</label>
            <input
              type="text"
              required
              className="input-field"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) });
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Slug</label>
            <input
              type="text"
              required
              className="input-field"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Deskripsi</label>
            <textarea
              required
              className="input-field min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Harga (Rp)</label>
            <input
              type="number"
              required
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPublished" className="text-sm text-text">Publikasikan</label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Menyimpan..." : "Buat Kelas"}
          </button>
        </form>
    </div>
  );
}