"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string;
  correctIndex: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  isPublished: boolean;
  modules: Module[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "modules" | "quizzes">("info");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    isPublished: true,
    thumbnailUrl: "",
    trailerUrl: "",
  });

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data);
        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description,
          price: data.price.toString(),
          isPublished: data.isPublished,
          thumbnailUrl: data.thumbnailUrl || "",
          trailerUrl: data.trailerUrl || "",
        });
      });
  }, [courseId]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (res.ok) {
        toast("Kelas berhasil diupdate!", "success");
      } else {
        toast("Gagal update kelas", "error");
      }
    } catch {
      toast("Gagal update kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Hapus kelas ini? Semua modul dan data terkait akan dihapus.")) return;
    try {
      await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      toast("Kelas dihapus", "success");
      router.push("/admin/courses");
    } catch {
      toast("Gagal menghapus kelas", "error");
    }
  };

  const handleAddModule = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Modul Baru",
          description: "",
          order: (course?.modules.length || 0) + 1,
        }),
      });
      if (res.ok) {
        const mod = await res.json();
        setCourse((prev) =>
          prev ? { ...prev, modules: [...prev.modules, { ...mod, quizzes: [] }] } : prev
        );
        toast("Modul ditambahkan", "success");
      }
    } catch {
      toast("Gagal menambah modul", "error");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Hapus modul ini?")) return;
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });
      setCourse((prev) =>
        prev
          ? { ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) }
          : prev
      );
      toast("Modul dihapus", "success");
    } catch {
      toast("Gagal menghapus modul", "error");
    }
  };

  const handleAddQuiz = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Kuis Baru", passingScore: 70 }),
      });
      if (res.ok) {
        const quiz = await res.json();
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) =>
                  m.id === moduleId
                    ? { ...m, quizzes: [...m.quizzes, { ...quiz, questions: [] }] }
                    : m
                ),
              }
            : prev
        );
        toast("Kuis ditambahkan", "success");
      }
    } catch {
      toast("Gagal menambah kuis", "error");
    }
  };

  const handleDeleteQuiz = async (moduleId: string, quizId: string) => {
    if (!confirm("Hapus kuis ini?")) return;
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, quizzes: m.quizzes.filter((q) => q.id !== quizId) }
                  : m
              ),
            }
          : prev
      );
      toast("Kuis dihapus", "success");
    } catch {
      toast("Gagal menghapus kuis", "error");
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted">Memuat...</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/courses" className="text-text-muted hover:text-primary mb-4 inline-block">
        <ArrowLeft className="w-4 h-4 inline mr-1" />
        Kembali
      </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Edit Kelas</h1>
          <button
            onClick={handleDeleteCourse}
            className="text-sm py-2 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Hapus
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
          {(["info", "modules", "quizzes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab === "info" && "📝 Info Kelas"}
              {tab === "modules" && "📚 Modul"}
              {tab === "quizzes" && "❓ Kuis"}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <form onSubmit={handleUpdateCourse} className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Judul Kelas</label>
              <input
                type="text"
                required
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Thumbnail URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Trailer YouTube URL</label>
              <input
                type="url"
                className="input-field"
                value={form.trailerUrl}
                onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-4">
            <button onClick={handleAddModule} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Modul
            </button>
            {course.modules.length === 0 ? (
              <div className="card p-8 text-center">
                <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">Belum ada modul.</p>
              </div>
            ) : (
              course.modules.map((mod, i) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  index={i}
                  courseId={courseId}
                  onDelete={() => handleDeleteModule(mod.id)}
                  onUpdate={(updated) =>
                    setCourse((prev) =>
                      prev
                        ? {
                            ...prev,
                            modules: prev.modules.map((m) =>
                              m.id === updated.id ? { ...m, ...updated } : m
                            ),
                          }
                        : prev
                    )
                  }
                />
              ))
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            {course.modules.length === 0 ? (
              <div className="card p-8 text-center">
                <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">Tambahkan modul terlebih dahulu.</p>
              </div>
            ) : (
              course.modules.map((mod) => (
                <div key={mod.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text">{mod.title}</h3>
                    <button
                      onClick={() => handleAddQuiz(mod.id)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Kuis
                    </button>
                  </div>
                  {mod.quizzes.length === 0 ? (
                    <p className="text-sm text-text-muted">Belum ada kuis.</p>
                  ) : (
                    <div className="space-y-2">
                      {mod.quizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-text">{quiz.title}</p>
                            <p className="text-xs text-text-muted">
                              {quiz.questions.length} soal • Nilai minimum: {quiz.passingScore}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/courses/${courseId}/modules/${mod.id}/quizzes/${quiz.id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              Edit Soal
                            </Link>
                            <button
                              onClick={() => handleDeleteQuiz(mod.id, quiz.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
    </div>
  );
}

function ModuleCard({
  module: mod,
  index,
  courseId,
  onDelete,
  onUpdate,
}: {
  module: Module;
  index: number;
  courseId: string;
  onDelete: () => void;
  onUpdate: (m: Partial<Module>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: mod.title,
    description: mod.description || "",
    videoUrl: mod.videoUrl || "",
    pdfUrl: mod.pdfUrl || "",
    audioUrl: mod.audioUrl || "",
    duration: mod.duration?.toString() || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${mod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: form.duration ? parseInt(form.duration) : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setEditing(false);
        toast("Modul diupdate", "success");
      } else {
        toast("Gagal update modul", "error");
      }
    } catch {
      toast("Gagal update modul", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
          {index + 1}
        </div>
        <h3 className="font-semibold text-text flex-1">{mod.title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(!editing)} className="text-xs text-primary hover:underline">
            {editing ? "Batal" : "Edit"}
          </button>
          <button onClick={onDelete} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            className="input-field"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Judul modul"
          />
          <textarea
            className="input-field min-h-[60px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi singkat"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="url"
              className="input-field text-sm"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="URL Video YouTube"
            />
            <input
              type="number"
              className="input-field text-sm"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="Durasi (menit)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="url"
              className="input-field text-sm"
              value={form.pdfUrl}
              onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              placeholder="URL PDF"
            />
            <input
              type="url"
              className="input-field text-sm"
              value={form.audioUrl}
              onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              placeholder="URL Audio"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 px-4"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      ) : (
        <div className="text-sm text-text-muted space-y-1">
          {mod.description && <p>{mod.description}</p>}
          <div className="flex flex-wrap gap-3 mt-2">
            {mod.videoUrl && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">🎥 Video</span>
            )}
            {mod.pdfUrl && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">📄 PDF</span>
            )}
            {mod.audioUrl && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">🎵 Audio</span>
            )}
            {mod.duration && (
              <span className="text-xs bg-gray-100 text-text-muted px-2 py-1 rounded-full">⏱ {mod.duration} menit</span>
            )}
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
              ❓ {mod.quizzes.length} kuis
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
