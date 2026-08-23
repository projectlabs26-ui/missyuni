import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Trophy, ShoppingCart, Bell, Calendar, Play, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupiah, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id! },
    include: {
      course: { include: { modules: true } },
      moduleProgresses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const uniqueEnrollments = enrollments.reduce((acc: any[], enr) => {
    const existing = acc.find((e: any) => e.courseId === enr.courseId);
    if (!existing || new Date(enr.createdAt) > new Date(existing.createdAt)) {
      return [...acc.filter((e: any) => e.courseId !== enr.courseId), enr];
    }
    return acc;
  }, []);

  const enrolledCourseIds = uniqueEnrollments.map((e) => e.courseId);

  const certificates = await db.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const liveEvents = await db.liveEvent.findMany({
    where: { scheduledAt: { gte: new Date().toISOString() } },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  const announcements = await db.announcement.findMany({
    where: { isPublished: true, targetRole: { in: ["all", "student"] } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const allCourses = await db.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.includes(c.id));

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-text">
          Halo, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm text-text-muted mt-0.5">Yuk lanjut belajar</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{uniqueEnrollments.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Kelas Diikuti</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{certificates.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Sertifikat</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{availableCourses.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Tersedia</p>
        </div>
      </div>

      {/* Announcements & Events - Horizontal scroll on mobile */}
      {(announcements.length > 0 || liveEvents.length > 0) && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:mx-0">
          {announcements.map((ann) => (
            <div key={ann.id} className="card p-4 bg-amber-50 border-amber-200 shrink-0 w-72 lg:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Pengumuman</span>
              </div>
              <p className="font-semibold text-sm text-text">{ann.title}</p>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{ann.content}</p>
            </div>
          ))}
          {liveEvents.map((event) => (
            <a
              key={event.id}
              href={event.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 bg-pink-50 border-pink-200 shrink-0 w-72 lg:w-auto block"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-medium text-pink-700">Live Event</span>
              </div>
              <p className="font-semibold text-sm text-text">{event.title}</p>
              <p className="text-xs text-text-muted mt-1">
                {formatDate(event.scheduledAt)} • {event.platform?.toUpperCase()}
              </p>
              <span className="text-xs text-primary font-medium mt-2 inline-block">Join →</span>
            </a>
          ))}
        </div>
      )}

      {/* Kelas Saya */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Kelas Saya
          </h2>
          {uniqueEnrollments.length > 0 && (
            <span className="text-xs text-text-muted">{uniqueEnrollments.length} kelas</span>
          )}
        </div>

        {uniqueEnrollments.length === 0 ? (
          <div className="card p-6 text-center">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-muted mb-3">Belum ada kelas</p>
            <a href="#catalog" className="btn-primary text-sm py-2 px-4">Lihat Katalog</a>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueEnrollments.map((enr) => {
              const total = enr.course.modules?.length || 0;
              const done = Math.min(
                enr.moduleProgresses?.filter((p: any) => p.completed).length || 0,
                total
              );
              const pct = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0;
              return (
                <Link
                  key={enr.id}
                  href={`/dashboard/${enr.courseId}`}
                  className="card p-4 flex items-center gap-4 hover:border-primary/40 transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    {enr.completedAt ? (
                      <Trophy className="w-5 h-5 text-accent" />
                    ) : (
                      <Play className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-text truncate">{enr.course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span>{done}/{total} Modul</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Katalog Kelas */}
      <section id="catalog">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Katalog Kelas
          </h2>
          <span className="text-xs text-text-muted">{availableCourses.length} kelas</span>
        </div>

        {availableCourses.length === 0 ? (
          <div className="card p-6 text-center">
            <Trophy className="w-10 h-10 text-accent mx-auto mb-2" />
            <p className="text-sm text-text-muted">Semua kelas sudah kamu beli! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableCourses.map((course) => (
              <div key={course.id} className="card overflow-hidden flex flex-col">
                <div className="h-20 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary/40" />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-text text-xs truncate">{course.title}</h3>
                  <p className="text-[10px] text-text-muted line-clamp-2 mt-1 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="font-bold text-primary text-xs">{formatRupiah(course.price)}</span>
                    <Link href={`/checkout/${course.id}`} className="btn-primary text-[10px] py-1 px-2.5">
                      Beli
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sertifikat */}
      {certificates.length > 0 && (
        <section id="certificates">
          <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Sertifikat Saya
          </h2>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="card p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text truncate">{cert.course.title}</p>
                  <p className="text-xs text-text-muted">Kode: {cert.code}</p>
                </div>
                <a
                  href={cert.pdfUrl || "#"}
                  className="btn-primary text-xs py-2 px-4 shrink-0 ml-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unduh
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}