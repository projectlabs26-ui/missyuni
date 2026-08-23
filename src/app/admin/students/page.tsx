import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AdminStudentsPage() {
  const students = await db.user.findMany({
    where: { role: "student" },
    include: {
      enrollments: { include: { course: true } },
      transactions: true,
      certificates: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Manajemen Siswa</h1>

      <div className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="card p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{student.name}</p>
                    <p className="text-sm text-text-muted">{student.email}</p>
                    <p className="text-xs text-text-muted">
                      WA: {student.whatsapp || "Tidak ada"} • Daftar: {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-text">{student.enrollments.length}</p>
                  <p className="text-text-muted">Kelas</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-text">
                    {student.enrollments.reduce((acc: number, e: any) => acc + Math.round(e.progress), 0) /
                      Math.max(student.enrollments.length, 1)}%
                  </p>
                  <p className="text-text-muted">Rata-rata Progress</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-text">{student.certificates.length}</p>
                  <p className="text-text-muted">Sertifikat</p>
                </div>
              </div>
            </div>

            {student.enrollments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-text mb-2">Kelas yang diambil:</p>
                <div className="space-y-2">
                  {student.enrollments.map((enr: any) => (
                    <div key={enr.id} className="flex items-center justify-between text-sm">
                      <span className="text-text">{enr.course.title}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${enr.progress}%` }} />
                        </div>
                        <span className="text-text-muted w-10 text-right">{Math.round(enr.progress)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}