import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contents = await db.salesPageContent.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Get sales page content error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contents } = await req.json();

    if (!Array.isArray(contents)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // Upsert each content section
    const results = [];
    for (const content of contents) {
      const result = await db.salesPageContent.upsert({
        where: { section: content.section },
        update: {
          title: content.title,
          subtitle: content.subtitle,
          body: content.body,
          imageUrl: content.imageUrl,
          order: content.order,
        },
        create: {
          section: content.section,
          title: content.title,
          subtitle: content.subtitle,
          body: content.body,
          imageUrl: content.imageUrl,
          order: content.order,
        },
      });
      results.push(result);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Update sales page content error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
