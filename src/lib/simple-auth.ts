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
    let decoded: string;
    try {
      decoded = atob(sessionCookie.value);
    } catch {
      decoded = sessionCookie.value;
    }
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
