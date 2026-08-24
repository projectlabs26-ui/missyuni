export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CourseViewer } from "@/components/course/course-viewer";
import { ModuleList } from "@/components/course/module-list";
import { QuizSection } from "@/components/course/quiz-section";
import { CertificateSection } from "@/components/course/certificate-section";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { courseId } = await params;

  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id!,
      courseId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              quizzes: {
                include: {
                  questions: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
      moduleProgresses: true,
    },
  });

  if (!enrollment) notFound();

  const { course, moduleProgresses } = enrollment;
  const totalModules = course.modules.length;
  const completedModules = moduleProgresses.filter((p: any) => p.completed).length;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Check if all quizzes passed
  const allQuizzes = course.modules.flatMap((m: any) => m.quizzes);
  const quizAttempts = await db.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quizId: { in: allQuizzes.map((q: any) => q.id) },
    },
  });

  const allQuizzesPassed = allQuizzes.length > 0 && allQuizzes.every((q: any) =>
    quizAttempts.some((a: any) => a.quizId === q.id && a.passed)
  );

  // Check certificate
  const certificate = await db.certificate.findFirst({
    where: {
      userId: session.user.id,
      courseId: courseId,
    },
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Back link */}
      <a href="/dashboard" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors">
        ← Kembali ke Dashboard
      </a>

      {/* Course Header */}
      <div className="card p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-text mb-1">{course.title}</h1>
        <p className="text-sm text-text-muted mb-3">{course.description}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-text-muted whitespace-nowrap">
            {completedModules}/{totalModules} modul • {progress}%
          </span>
        </div>
      </div>

      {/* Mobile: Module list (collapsible via CSS) */}
      <div className="lg:hidden">
        <ModuleList
          modules={course.modules}
          moduleProgresses={moduleProgresses}
          enrollmentId={enrollment.id}
          courseId={courseId}
        />
      </div>

      {/* Desktop: 2-column layout */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <CourseViewer
            modules={course.modules}
            moduleProgresses={moduleProgresses}
            courseId={courseId}
          />

          <QuizSection
            modules={course.modules as any}
            quizAttempts={quizAttempts}
            userId={session.user.id!}
          />

          <CertificateSection
            courseId={courseId}
            courseTitle={course.title}
            userName={session.user.name ?? ""}
            certificate={certificate}
            allModulesCompleted={progress === 100}
            allQuizzesPassed={allQuizzesPassed}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ModuleList
              modules={course.modules}
              moduleProgresses={moduleProgresses}
              enrollmentId={enrollment.id}
              courseId={courseId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
