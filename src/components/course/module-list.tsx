"use client";

import { useState } from "react";
import { CheckCircle, Circle, Play, FileText, Headphones, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

  const completedCount = progresses.filter((p) => p.completed).length;

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
    <div className="card overflow-hidden">
      {/* Header - always visible, toggle for mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors lg:cursor-default"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-text text-sm">Daftar Modul</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {completedCount}/{modules.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${modules.length > 0 ? (completedCount / modules.length) * 100 : 0}%` }}
            />
          </div>
          {/* Mobile toggle */}
          <span className="lg:hidden text-text-muted">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Module list - collapsible on mobile */}
      <div className={`${expanded ? "block" : "hidden"} lg:block`}>
        <div className="px-3 pb-3 space-y-1 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {modules.map((mod, i) => {
            const progress = progresses.find((p) => p.moduleId === mod.id);
            const isCompleted = progress?.completed;

            return (
              <button
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={`w-full flex items-center gap-3 p-2.5 lg:p-3 rounded-xl text-left transition-all
                  ${isCompleted ? "bg-green-50" : "hover:bg-gray-50"}`}
              >
                <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isCompleted ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"}`}>
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  ) : (
                    getIcon(mod)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs lg:text-sm font-medium truncate ${isCompleted ? "text-green-700 line-through" : "text-text"}`}>
                    {i + 1}. {mod.title}
                  </p>
                  {mod.duration && (
                    <p className="text-[10px] lg:text-xs text-text-muted">{mod.duration} menit</p>
                  )}
                </div>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
