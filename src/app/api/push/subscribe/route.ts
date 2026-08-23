import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// In-memory store for subscriptions (in production, use database)
const subscriptions: Map<string, any> = new Map();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Store subscription with user ID
    subscriptions.set(session.user.id, {
      userId: session.user.id,
      subscription,
      createdAt: new Date(),
    });

    console.log("[Push] Subscription stored for user:", session.user.id);

    return NextResponse.json({ message: "Subscription stored" });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return all subscriptions (admin only)
    const allSubscriptions = Array.from(subscriptions.values());

    return NextResponse.json({
      count: allSubscriptions.length,
      subscriptions: allSubscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
