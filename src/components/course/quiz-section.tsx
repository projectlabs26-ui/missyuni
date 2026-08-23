"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle, XCircle, Trophy } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import type { Module, QuizAttempt } from "@/types";

interface QuizSectionProps {
  modules: (Module & {
    quizzes?: (QuizWithQuestions & { questions?: Question[] })[];
  })[];
  quizAttempts: QuizAttempt[];
  userId: string;
}

interface QuizWithQuestions {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string;  // JSON string from DB
  correctIndex: number;
}

function parseOptions(options: string): string[] {
  try {
    return JSON.parse(options);
  } catch {
    return [];
  }
}

export function QuizSection({ modules, quizAttempts, userId }: QuizSectionProps) {
  const allQuizzes = modules.flatMap((m: any) =>
    (m.quizzes || []).map((q: any) => ({ ...q, moduleTitle: m.title }))
  ) as (QuizWithQuestions & { moduleTitle: string })[];

  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleSubmit = async (quizId: string) => {
    const quiz = allQuizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    setScores((prev) => ({ ...prev, [quizId]: score }));
    setSubmitted((prev) => ({ ...prev, [quizId]: true }));

    try {
      const res = await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          userId,
          score,
          passed,
          answers: JSON.stringify(answers),
        }),
      });

      if (res.ok) {
        toast(passed ? "Selamat! Kamu lulus kuis! 🎉" : "Nilai belum mencapai KKM. Coba lagi!", passed ? "success" : "error");
      }
    } catch {
      toast("Gagal menyimpan jawaban", "error");
    }
  };

  if (allQuizzes.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        Kuis
      </h2>

      <div className="space-y-4">
        {allQuizzes.map((quiz) => {
          const attempt = quizAttempts.find((a) => a.quizId === quiz.id);
          const isActive = activeQuiz === quiz.id;
          const isSubmitted = submitted[quiz.id];
          const isPassed = attempt?.passed || (isSubmitted && (scores[quiz.id] || 0) >= quiz.passingScore);

          return (
            <div key={quiz.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveQuiz(isActive ? null : quiz.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isPassed ? (
                    <Trophy className="w-5 h-5 text-accent" />
                  ) : isSubmitted ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-primary" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-text">{quiz.title}</p>
                    <p className="text-xs text-text-muted">
                      {quiz.moduleTitle} • KKM {quiz.passingScore}% • {quiz.questions.length} Soal
                    </p>
                  </div>
                </div>
                {isPassed && <CheckCircle className="w-5 h-5 text-green-500" />}
              </button>

              {isActive && !isSubmitted && (
                <div className="border-t border-gray-200 p-4 space-y-6">
                  {quiz.questions.map((q, qi) => (
                    <div key={q.id}>
                      <p className="font-medium text-text mb-2">
                        {qi + 1}. {q.text}
                      </p>
                      <div className="space-y-2">
                        {parseOptions(q.options).map((opt: string, oi: number) => (
                          <label
                            key={oi}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all
                              ${answers[q.id] === oi
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={oi}
                              checked={answers[q.id] === oi}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                              }
                              className="w-4 h-4 text-primary"
                            />
                            <span className="text-sm text-text">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleSubmit(quiz.id)}
                    disabled={quiz.questions.some((q) => answers[q.id] === undefined)}
                    className="btn-primary w-full py-2.5"
                  >
                    Kumpulkan Jawaban
                  </button>
                </div>
              )}

              {isSubmitted && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <p className={`font-semibold ${isPassed ? "text-green-600" : "text-red-600"}`}>
                    Nilai: {scores[quiz.id] || 0}% — {isPassed ? "Lulus ✅" : "Belum Lulus ❌"}
                  </p>
                  {!isPassed && (
                    <button
                      onClick={() => {
                        setActiveQuiz(quiz.id);
                        setSubmitted((prev) => ({ ...prev, [quiz.id]: false }));
                        setAnswers({});
                      }}
                      className="text-sm text-primary hover:underline mt-2"
                    >
                      Coba Lagi
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}