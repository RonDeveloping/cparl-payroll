"use server";

import prisma from "@/db/prismaDrizzle";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs"; // Or your preferred hashing lib
import { encrypt, decrypt } from "@/utils/user/session";

/**
 * LOGIN: Validates credentials and sets the cookie
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Find the user by email (the Source of Truth)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password." };
  }

  // 2. Verify password
  const isPasswordValid = await compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { error: "Invalid email or password." };
  }

  // 3. Create Session Payload
  // Include contactId and slug so services have context without extra DB lookups
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({
    userId: user.id,
    // contactId: user.contactId,
    slug: user.slug,
    expiresAt,
  });

  // 4. Set HTTP-Only Cookie
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

/**
 * LOGOUT: Clears the session cookie
 */
export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/login");
}

/**
 * SESSION MANAGEMENT: Helper to get the current user in other actions
 */
export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const payload = await decrypt(sessionCookie);
    return payload;
  } catch {
    return null;
  }
}

/**
 * verifySession: The "Gold Standard" check.
 * Used inside Server Actions to ensure the user is still valid.
 */
export async function verifySession() {
  // 1. Get and Decrypt the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (!session?.userId) {
    return null;
  }

  // 2. Database Check (Critical for Security)
  // Ensures that if a user is deleted or their security_email changes,
  // their old session is immediately invalidated.
  const userId =
    typeof session?.userId === "string" ? session.userId : undefined;
  if (!userId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, slug: true },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    slug: user.slug,
  };
}
