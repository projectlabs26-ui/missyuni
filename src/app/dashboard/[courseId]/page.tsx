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
    <div>
      <div className="flex items-center justify-between mb-6">
        <a href="/dashboard" className="text-text-muted hover:text-primary transition-colors">
          ← Kembali ke Dashboard
        </a>
        <span className="text-sm text-text-muted">
          {completedModules}/{totalModules} Modul • {progress}%
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-text mb-1">{course.title}</h1>
              <p className="text-text-muted">{course.description}</p>
            </div>

            {/* Course Viewer with module navigation */}
            <CourseViewer
              modules={course.modules}
              moduleProgresses={moduleProgresses}
              courseId={courseId}
            />

            {/* Quiz Section */}
            <QuizSection
              modules={course.modules as any}
              quizAttempts={quizAttempts}
              userId={session.user.id!}
            />

            {/* Certificate */}
            <CertificateSection
              courseId={courseId}
              courseTitle={course.title}
              userName={session.user.name ?? ""}
              certificate={certificate}
              allModulesCompleted={progress === 100}
              allQuizzesPassed={allQuizzesPassed}
            />
          </div>

          {/* Sidebar - Module List */}
          <div>
            <ModuleList
              modules={course.modules}
              moduleProgresses={moduleProgresses}
              enrollmentId={enrollment.id}
              courseId={courseId}
            />
          </div>
        </div>
    </div>
  );
}