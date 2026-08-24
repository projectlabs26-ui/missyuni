import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface Session {
  user: SessionUser;
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) return null;

    const user = JSON.parse(sessionCookie.value);
    if (!user || !user.id) return null;
    return { user };
  } catch {
    return null;
  }
}

export async function signIn() {
  return { error: "Use /api/simple-login instead" };
}

export async function signOut() {
  return { error: "Not implemented" };
}

export const handlers = {
  GET: async () => new Response("Not implemented", { status: 501 }),
  POST: async () => new Response("Not implemented", { status: 501 }),
};
