import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function ApproveTransactionPage({
  params,
}: {
  params: Promise<{ txId: string }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const { txId } = await params;

  const transaction = await db.transaction.findUnique({
    where: { id: txId },
    include: { user: true, course: true },
  });

  if (!transaction || transaction.status !== "pending") {
    redirect("/admin/transactions");
  }

  // Auto-approve and create enrollment
  await db.transaction.update({
    where: { id: txId },
    data: { status: "approved" },
  });

  // Create enrollment if not already enrolled
  const existingEnrollment = await db.enrollment.findFirst({
    where: {
      userId: transaction.userId,
      courseId: transaction.courseId,
    },
  });

  if (!existingEnrollment) {
    await db.enrollment.create({
      data: {
        userId: transaction.userId,
        courseId: transaction.courseId,
      },
    });
  }

  redirect("/admin?approved=true");
}