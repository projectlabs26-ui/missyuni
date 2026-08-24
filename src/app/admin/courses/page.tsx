export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { Plus, Edit, Eye, EyeOff, BookOpen } from "lucide-react";

export default async function AdminCoursesPage() {
  let courses: any[] = [];
  try {
    courses = await db.course.findMany({
      include: {
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Courses query error:", e);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Manajemen Kelas</h1>
        <Link href="/admin/courses/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kelas
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="card overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text">{course.title}</h3>
                {course.isPublished ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-text-muted" />
                )}
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-3">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                <span>{course._count.modules} Modul</span>
                <span>{course._count.enrollments} Siswa</span>
                <span className="font-bold text-primary">{formatRupiah(course.price)}</span>
              </div>
              <Link
                href={`/admin/courses/${course.id}`}
                className="btn-outline w-full text-center text-sm py-2 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Kelas
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}