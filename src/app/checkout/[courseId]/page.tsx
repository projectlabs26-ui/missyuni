export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { CheckoutForm } from "@/components/course/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { modules: true },
  });

  if (!course || !course.isPublished) notFound();

  // Check if already enrolled
  const existingEnrollment = await db.enrollment.findFirst({
    where: { userId: session.user.id, courseId },
  });

  const existingTransaction = await db.transaction.findFirst({
    where: {
      userId: session.user.id,
      courseId,
      status: "pending",
    },
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-custom py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-text mb-2">Checkout</h1>
        <p className="text-text-muted mb-8">Selesaikan pembayaran untuk mengakses kelas.</p>

        {/* Course Summary */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              📚
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-text">{course.title}</h2>
              <p className="text-sm text-text-muted">
                {course.modules?.length || 0} Modul • Akses Seumur Hidup
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatRupiah(course.price)}
              </p>
            </div>
          </div>
        </div>

        {existingEnrollment ? (
          <div className="card p-6 text-center bg-green-50 border-green-200">
            <p className="text-green-700 font-semibold">
              ✅ Kamu sudah terdaftar di kelas ini!
            </p>
            <a href={`/dashboard/${courseId}`} className="btn-primary mt-4 inline-block">
              Buka Kelas
            </a>
          </div>
        ) : existingTransaction ? (
          <div className="card p-6 text-center bg-amber-50 border-amber-200">
            <p className="text-amber-700 font-semibold">
              ⏳ Pembayaran kamu sedang diverifikasi oleh admin.
            </p>
            <p className="text-amber-600 text-sm mt-1">
              Tunggu beberapa saat, akses kelas akan dibuka setelah disetujui.
            </p>
          </div>
        ) : (
          <CheckoutForm course={course} />
        )}
      </div>
    </div>
  );
}