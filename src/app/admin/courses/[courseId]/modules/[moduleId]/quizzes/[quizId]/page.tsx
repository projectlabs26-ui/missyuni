"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  GripVertical,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  });

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data);
        setQuestions(
          data.questions.map((q: any) => ({
            ...q,
            options: JSON.parse(q.options),
          }))
        );
        setLoading(false);
      });
  }, [courseId, moduleId, quizId]);

  const resetForm = () => {
    setForm({ text: "", options: ["", "", "", ""], correctIndex: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (q: Question) => {
    setForm({
      text: q.text,
      options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      correctIndex: q.correctIndex,
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text || form.options.some((o) => !o.trim())) {
      toast("Lengkapi semua field", "error");
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/${editingId}`
        : `/api/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.text,
          options: form.options,
          correctIndex: form.correctIndex,
          order: questions.length + 1,
        }),
      });

      if (res.ok) {
        const q = await res.json();
        if (editingId) {
          setQuestions(questions.map((item) => (item.id === editingId ? { ...item, ...q, options: form.options } : item)));
          toast("Soal diupdate", "success");
        } else {
          setQuestions([...questions, { ...q, options: form.options }]);
          toast("Soal ditambahkan", "success");
        }
        resetForm();
      } else {
        toast("Gagal menyimpan soal", "error");
      }
    } catch {
      toast("Gagal menyimpan soal", "error");
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/questions/${questionId}`,
        { method: "DELETE" }
      );
      setQuestions(questions.filter((q) => q.id !== questionId));
      toast("Soal dihapus", "success");
    } catch {
      toast("Gagal menghapus soal", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted">Memuat...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-text-muted hover:text-primary mb-4 inline-block"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          Kembali ke Edit Kelas
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">{quiz?.title}</h1>
            <p className="text-sm text-text-muted mt-1">
              {questions.length} soal • Nilai minimum: {quiz?.passingScore}%
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-text">
              {editingId ? "Edit Soal" : "Tambah Soal Baru"}
            </h3>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Pertanyaan</label>
              <textarea
                required
                className="input-field min-h-[80px]"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Tulis pertanyaan di sini..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-text">Pilihan Jawaban</label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: i })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      form.correctIndex === i
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-text-muted hover:bg-gray-200"
                    }`}
                    title={form.correctIndex === i ? "Jawaban benar" : "Set sebagai jawaban benar"}
                  >
                    {form.correctIndex === i ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{String.fromCharCode(65 + i)}</span>
                    )}
                  </button>
                  <input
                    type="text"
                    required
                    className="input-field flex-1"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...form.options];
                      newOptions[i] = e.target.value;
                      setForm({ ...form, options: newOptions });
                    }}
                    placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-text-muted">
              Klik huruf (A/B/C/D) untuk menandai jawaban yang benar.
            </p>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? "Update Soal" : "Tambah Soal"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 rounded-xl text-text-muted hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Questions List */}
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-text-muted mb-4">Belum ada soal.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-sm"
              >
                Tambah Soal Pertama
              </button>
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text mb-3">{q.text}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt: string, j: number) => (
                        <div
                          key={j}
                          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                            j === q.correctIndex
                              ? "bg-green-50 text-green-700 font-medium"
                              : "text-text-muted"
                          }`}
                        >
                          {j === q.correctIndex ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(q)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}
