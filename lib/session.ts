// lib/session.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/db/prismaDrizzle";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_random_string_here",
);

type SessionPayload = {
  userId: string;
  slug: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function verifySession(): Promise<SessionPayload | null> {
  const session = await getSession();

  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, slug: true },
  });

  if (!user) return null;

  return { userId: user.id, slug: user.slug };
}
/*
the Cookie is the physical ink on the hand(hand stamp), and the Token is the specific "secret code" or "VIP" text written in that ink(stamp content ususally contains user_id, expiration_time and digital signature). Session is the overall concept of "being recognized and authenticated" after login. The server creates a Session in its database. It has a guest list: "User #42 is currently logged in from Chrome on a Mac." The server gives you a Token (the Session ID)."Put this abc-123 token inside a Cookie so you don't lose it."
*/
