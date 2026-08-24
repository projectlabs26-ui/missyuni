export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function RejectTransactionPage({
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
  });

  if (!transaction || transaction.status !== "pending") {
    redirect("/admin/transactions");
  }

  await db.transaction.update({
    where: { id: txId },
    data: { status: "rejected" },
  });

  redirect("/admin?rejected=true");
}