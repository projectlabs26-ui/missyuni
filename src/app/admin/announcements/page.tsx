"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toaster";
import { Plus, Trash2, Eye, EyeOff, Send, Megaphone } from "lucide-react";

interface Announcement {
  id: string; title: string; content: string; isPublished: boolean; targetRole: string; createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "all", isPublished: true });

  useEffect(() => {
    fetch("/api/admin/announcements").then((r) => r.json()).then((data) => {
      setAnnouncements(data); setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        const ann = await res.json();
        setAnnouncements([ann, ...announcements]);
        setForm({ title: "", content: "", targetRole: "all", isPublished: true });
        setShowForm(false);
        toast("Pengumuman berhasil dibuat!", "success");
      } else { toast("Gagal membuat pengumuman", "error"); }
    } catch { toast("Gagal membuat pengumuman", "error"); }
  };

  const handleTogglePublish = async (ann: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !ann.isPublished }),
      });
      if (res.ok) {
        setAnnouncements(announcements.map((a) => a.id === ann.id ? { ...a, isPublished: !a.isPublished } : a));
        toast(ann.isPublished ? "Pengumuman disembunyikan" : "Pengumuman dipublikasikan", "success");
      }
    } catch { toast("Gagal update", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      setAnnouncements(announcements.filter((a) => a.id !== id));
      toast("Pengumuman dihapus", "success");
    } catch { toast("Gagal menghapus", "error"); }
  };

  const getTargetLabel = (target: string) => {
    switch (target) { case "student": return "Siswa"; case "admin": return "Admin"; default: return "Semua"; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> Broadcast Pengumuman
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Judul</label>
            <input type="text" required className="input-field" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul pengumuman" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Isi Pengumuman</label>
            <textarea required className="input-field min-h-[120px]" value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tulis pengumuman di sini..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Target</label>
              <select className="input-field" value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="all">Semua</option>
                <option value="student">Siswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-3">
                <input type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-text">Publikasikan</span>
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Kirim Pengumuman
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-text-muted text-center py-8">Memuat...</p>
      ) : announcements.length === 0 ? (
        <div className="card p-8 text-center">
          <Megaphone className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted">Belum ada pengumuman.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text">{ann.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ann.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-text-muted"}`}>
                      {ann.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {getTargetLabel(ann.targetRole)}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(ann.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button onClick={() => handleTogglePublish(ann)} className="p-2 hover:bg-gray-100 rounded-lg"
                    title={ann.isPublished ? "Sembunyikan" : "Publikasikan"}>
                    {ann.isPublished ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-text-muted" />}
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}