import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import webPush from "web-push";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    "mailto:admin@missyuni.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

// In-memory store (same as subscribe route)
const subscriptions: Map<string, any> = new Map();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "Push notifications not configured. Set VAPID keys in .env" },
        { status: 503 }
      );
    }

    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body required" }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const [userId, sub] of subscriptions.entries()) {
      try {
        await webPush.sendNotification(sub.subscription, payload);
        sentCount++;
      } catch (error) {
        console.error(`[Push] Failed to send to user ${userId}:`, error);
        failedCount++;
        if ((error as any)?.statusCode === 410) {
          subscriptions.delete(userId);
        }
      }
    }

    return NextResponse.json({
      message: `Push notifications sent`,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
