"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Plus, Trash2 } from "lucide-react";

interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  platform: string;
  joinUrl: string;
  scheduledAt: string;
  duration: number | null;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", platform: "zoom", joinUrl: "", scheduledAt: "", duration: "60",
  });

  useEffect(() => {
    fetch("/api/admin/events").then((r) => r.json()).then(setEvents);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration), scheduledAt: new Date(form.scheduledAt).toISOString() }),
      });
      if (res.ok) {
        toast("Event berhasil dibuat!", "success");
        setShowForm(false);
        router.refresh();
        const data = await res.json();
        setEvents([...events, data]);
      } else { toast("Gagal membuat event", "error"); }
    } catch { toast("Gagal membuat event", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      setEvents(events.filter((e) => e.id !== id));
      toast("Event dihapus", "success");
    } catch { toast("Gagal menghapus event", "error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Live Events</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <input type="text" required placeholder="Judul Event" className="input-field"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Deskripsi" className="input-field min-h-[80px]"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <select className="input-field" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option value="zoom">Zoom</option>
              <option value="gmeet">Google Meet</option>
            </select>
            <input type="number" placeholder="Durasi (menit)" className="input-field"
              value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <input type="url" required placeholder="Link Join (Zoom/GMeet)" className="input-field"
            value={form.joinUrl} onChange={(e) => setForm({ ...form, joinUrl: e.target.value })} />
          <input type="datetime-local" required className="input-field"
            value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-primary w-full py-2">
            {loading ? "Menyimpan..." : "Simpan Event"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-text">{event.title}</p>
              <p className="text-sm text-text-muted">
                {new Date(event.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {" • "}{event.platform.toUpperCase()}{" • "}{event.duration} menit
              </p>
            </div>
            <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}