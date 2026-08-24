import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) return null;

  try {
    // Try base64 decode first (new format)
    let value = sessionCookie.value;
    try {
      value = Buffer.from(value, "base64").toString("utf-8");
    } catch {
      // Not base64, use raw value (old format)
    }
    return JSON.parse(value);
  } catch {
    return null;
  }
}
