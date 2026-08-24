"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toaster";
import { Save, Layout, Globe, Plus, Trash2, Edit3, X, Star } from "lucide-react";

interface SalesContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
}

const SECTIONS = [
  { key: "hero", label: "Hero Section", desc: "Judul utama, tagline, badge, dan CTA" },
  { key: "about", label: "Tentang Kami", desc: "Judul, subjudul, dan fitur-fitur unggulan" },
  { key: "courses", label: "Katalog Kelas", desc: "Judul dan subjudul section katalog kelas" },
  { key: "testimonials", label: "Section Testimoni", desc: "Judul dan subjudul section testimoni" },
  { key: "cta", label: "Call to Action", desc: "Ajakan daftar dan badge" },
];

export default function AdminSalesPage() {
  const [contents, setContents] = useState<SalesContent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Testimonial form state
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(null);
  const [tmForm, setTmForm] = useState({ name: "", role: "", content: "", rating: 5 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/sales-page").then((r) => r.json()),
      fetch("/api/admin/testimonials").then((r) => r.json()),
    ]).then(([contentsData, testimonialsData]) => {
      setContents(Array.isArray(contentsData) ? contentsData : []);
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      setLoading(false);
    });
  }, []);

  const getContent = (section: string) => contents.find((c) => c.section === section);

  const updateLocal = (section: string, field: string, value: string) => {
    setContents((prev) => {
      const existing = prev.find((c) => c.section === section);
      if (existing) {
        return prev.map((c) => (c.section === section ? { ...c, [field]: value } : c));
      }
      return [...prev, { id: "", section, title: null, subtitle: null, body: null, imageUrl: null, order: SECTIONS.findIndex((s) => s.key === section) } as SalesContent];
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sales-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (res.ok) {
        toast("Konten sales page berhasil disimpan!", "success");
      } else {
        toast("Gagal menyimpan", "error");
      }
    } catch {
      toast("Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Testimonial CRUD
  const handleSaveTestimonial = async () => {
    if (!tmForm.name || !tmForm.content) {
      toast("Nama dan konten wajib diisi", "error");
      return;
    }
    try {
      const url = editTestimonial
        ? `/api/admin/testimonials/${editTestimonial.id}`
        : "/api/admin/testimonials";
      const method = editTestimonial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tmForm),
      });

      if (res.ok) {
        const data = await res.json();
        if (editTestimonial) {
          setTestimonials((prev) => prev.map((t) => (t.id === editTestimonial.id ? data : t)));
          toast("Testimoni diupdate!", "success");
        } else {
          setTestimonials((prev) => [data, ...prev]);
          toast("Testimoni ditambahkan!", "success");
        }
        setShowTestimonialForm(false);
        setEditTestimonial(null);
        setTmForm({ name: "", role: "", content: "", rating: 5 });
      } else {
        toast("Gagal menyimpan testimoni", "error");
      }
    } catch {
      toast("Gagal menyimpan testimoni", "error");
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        toast("Testimoni dihapus!", "success");
      } else {
        toast("Gagal menghapus", "error");
      }
    } catch {
      toast("Gagal menghapus", "error");
    }
  };

  const openEditTestimonial = (t: Testimonial) => {
    setEditTestimonial(t);
    setTmForm({ name: t.name, role: t.role || "", content: t.content, rating: t.rating });
    setShowTestimonialForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Layout className="w-6 h-6 text-primary" />
          Kelola Halaman Depan
        </h1>
        <a href="/" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
          <Globe className="w-4 h-4" /> Preview
        </a>
      </div>

        {loading ? (
          <p className="text-text-muted text-center py-8">Memuat...</p>
        ) : (
          <div className="space-y-8">
            {/* SALES PAGE SECTIONS */}
            <div>
              <h2 className="text-lg font-bold text-text mb-4">📝 Konten Section</h2>
              <div className="space-y-4">
                {SECTIONS.map((section) => {
                  const content = getContent(section.key);
                  return (
                    <div key={section.key} className="card p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-text">{section.label}</h3>
                        <p className="text-sm text-text-muted">{section.desc}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">Judul</label>
                          <input
                            type="text"
                            className="input-field"
                            value={content?.title || ""}
                            onChange={(e) => updateLocal(section.key, "title", e.target.value)}
                            placeholder="Judul section"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">Subjudul / Deskripsi</label>
                          <textarea
                            className="input-field min-h-[60px]"
                            value={content?.subtitle || ""}
                            onChange={(e) => updateLocal(section.key, "subtitle", e.target.value)}
                            placeholder="Subjudul atau deskripsi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">
                            {section.key === "about" ? "Fitur (JSON)" : section.key === "hero" ? "Badge Text" : section.key === "cta" ? "Badge Text" : "Body"}
                          </label>
                          {section.key === "about" ? (
                            <textarea
                              className="input-field min-h-[120px] font-mono text-xs"
                              value={content?.body || ""}
                              onChange={(e) => updateLocal(section.key, "body", e.target.value)}
                              placeholder='[{"icon":"Target","title":"Judul Fitur","desc":"Deskripsi"},...]'
                            />
                          ) : (
                            <input
                              type="text"
                              className="input-field"
                              value={content?.body || ""}
                              onChange={(e) => updateLocal(section.key, "body", e.target.value)}
                              placeholder="Text badge"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">Image URL</label>
                          <input
                            type="url"
                            className="input-field"
                            value={content?.imageUrl || ""}
                            onChange={(e) => updateLocal(section.key, "imageUrl", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleSaveAll} disabled={saving} className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan Semua Konten"}
              </button>
            </div>

            {/* TESTIMONIALS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text">💬 Testimoni</h2>
                <button
                  onClick={() => {
                    setEditTestimonial(null);
                    setTmForm({ name: "", role: "", content: "", rating: 5 });
                    setShowTestimonialForm(!showTestimonialForm);
                  }}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Tambah Testimoni
                </button>
              </div>

              {showTestimonialForm && (
                <div className="card p-6 mb-4 border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text">
                      {editTestimonial ? "Edit Testimoni" : "Tambah Testimoni Baru"}
                    </h3>
                    <button onClick={() => { setShowTestimonialForm(false); setEditTestimonial(null); }} className="text-text-muted hover:text-text">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">Nama *</label>
                        <input type="text" className="input-field" value={tmForm.name} onChange={(e) => setTmForm({ ...tmForm, name: e.target.value })} placeholder="Nama" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">Role</label>
                        <input type="text" className="input-field" value={tmForm.role} onChange={(e) => setTmForm({ ...tmForm, role: e.target.value })} placeholder="Siswa SMA, Mahasiswa, dll" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Konten *</label>
                      <textarea className="input-field min-h-[80px]" value={tmForm.content} onChange={(e) => setTmForm({ ...tmForm, content: e.target.value })} placeholder="Isi testimoni..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Rating: {tmForm.rating}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button key={r} onClick={() => setTmForm({ ...tmForm, rating: r })}>
                            <Star className={`w-6 h-6 ${r <= tmForm.rating ? "fill-accent text-accent" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleSaveTestimonial} className="btn-primary w-full py-2">
                      {editTestimonial ? "Update Testimoni" : "Simpan Testimoni"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="card p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text">{t.name}</span>
                        {t.role && <span className="text-xs text-text-muted">({t.role})</span>}
                        <div className="flex gap-0.5 ml-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < t.rating ? "fill-accent text-accent" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-text-muted">{t.content}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditTestimonial(t)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {testimonials.length === 0 && (
                  <p className="text-text-muted text-center py-4">Belum ada testimoni.</p>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}