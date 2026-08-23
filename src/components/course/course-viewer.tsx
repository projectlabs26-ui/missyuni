"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CoursePlayer } from "@/components/course/course-player";
import { PdfViewer } from "@/components/course/pdf-viewer";
import { AudioPlayer } from "@/components/course/audio-player";
import type { Module } from "@/types";

interface CourseViewerProps {
  modules: (Module & { quizzes?: any[] })[];
  moduleProgresses: Array<{ moduleId: string; completed: boolean; enrollmentId: string }>;
  courseId: string;
}

export function CourseViewer({
  modules,
  moduleProgresses,
  courseId,
}: CourseViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentModule = modules[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === modules.length - 1;

  const isCompleted = (moduleId: string) =>
    moduleProgresses.find((p) => p.moduleId === moduleId)?.completed ?? false;

  const markComplete = async (moduleId: string) => {
    await fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, completed: true }),
    });
  };

  const goNext = () => {
    if (isLast) return;
    if (!isCompleted(currentModule.id)) {
      markComplete(currentModule.id);
    }
    setCurrentIdx((i) => i + 1);
  };

  const goPrev = () => {
    if (isFirst) return;
    setCurrentIdx((i) => i - 1);
  };

  return (
    <div className="space-y-4">
      {/* Video / Content Player */}
      {currentModule.videoUrl && (
        <CoursePlayer videoUrl={currentModule.videoUrl} />
      )}
      {currentModule.pdfUrl && !currentModule.videoUrl && (
        <PdfViewer pdfUrl={currentModule.pdfUrl} title={currentModule.title} />
      )}
      {currentModule.audioUrl && !currentModule.videoUrl && !currentModule.pdfUrl && (
        <AudioPlayer audioUrl={currentModule.audioUrl} title={currentModule.title} />
      )}
      {!currentModule.videoUrl && !currentModule.pdfUrl && !currentModule.audioUrl && (
        <div className="card p-8 text-center text-text-muted text-sm">
          Modul ini tidak memiliki konten media. Baca deskripsi dan lanjutkan.
        </div>
      )}

      {/* Navigation */}
      <div className="card p-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">
            Modul {currentIdx + 1} dari {modules.length}
          </p>
          <p className="text-xs text-text-muted">{currentModule.title}</p>
        </div>
        <button
          onClick={goNext}
          disabled={isLast}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-30"
        >
          Selanjutnya
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}