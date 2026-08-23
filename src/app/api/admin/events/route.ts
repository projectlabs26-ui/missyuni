import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await db.liveEvent.findMany({
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, platform, joinUrl, scheduledAt, duration } = await req.json();

  if (!title || !joinUrl || !scheduledAt) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const event = await db.liveEvent.create({
    data: { title, description, platform, joinUrl, scheduledAt: new Date(scheduledAt), duration },
  });

  return NextResponse.json(event, { status: 201 });
}