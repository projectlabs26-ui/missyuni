"use client";

import { useState } from "react";
import { CheckCircle, Circle, Play, FileText, Headphones, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import type { Module, ModuleProgress } from "@/types";

interface ModuleListProps {
  modules: (Module & { quizzes?: any[] })[];
  moduleProgresses: ModuleProgress[];
  enrollmentId: string;
  courseId: string;
}

export function ModuleList({
  modules,
  moduleProgresses: initialProgresses,
  enrollmentId,
  courseId,
}: ModuleListProps) {
  const [progresses, setProgresses] = useState(initialProgresses);

  const toggleModule = async (moduleId: string) => {
    const current = progresses.find((p) => p.moduleId === moduleId);
    const newCompleted = !current?.completed;

    // Optimistic update
    setProgresses((prev) => {
      const exists = prev.some((p) => p.moduleId === moduleId);
      if (exists) {
        return prev.map((p) =>
          p.moduleId === moduleId ? { ...p, completed: newCompleted } : p
        );
      }
      return [...prev, { moduleId, completed: newCompleted, enrollmentId } as ModuleProgress];
    });

    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, completed: newCompleted }),
      });

      if (!res.ok) {
        setProgresses(initialProgresses);
        toast("Gagal update progress", "error");
      }
    } catch {
      setProgresses(initialProgresses);
      toast("Gagal update progress", "error");
    }
  };

  const getIcon = (module: Module) => {
    if (module.videoUrl) return <Play className="w-3 h-3" />;
    if (module.pdfUrl) return <FileText className="w-3 h-3" />;
    if (module.audioUrl) return <Headphones className="w-3 h-3" />;
    return <HelpCircle className="w-3 h-3" />;
  };

  return (
    <div className="card p-5 sticky top-20">
      <h3 className="font-semibold text-text mb-4">Daftar Modul</h3>
      <div className="space-y-1">
        {modules.map((mod, i) => {
          const progress = progresses.find((p) => p.moduleId === mod.id);
          const isCompleted = progress?.completed;

          return (
            <button
              key={mod.id}
              onClick={() => toggleModule(mod.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                ${isCompleted ? "bg-green-50" : "hover:bg-gray-50"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isCompleted ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"}`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  getIcon(mod)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCompleted ? "text-green-700 line-through" : "text-text"}`}>
                  {i + 1}. {mod.title}
                </p>
                {mod.duration && (
                  <p className="text-xs text-text-muted">{mod.duration} menit</p>
                )}
              </div>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}