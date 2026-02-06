// lib/actions/auth-actions.ts
"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

//TODO: Move this secret to an environment variable and ensure it's a secure, random value in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_random_string_here",
);

interface LoginData {
  email: string;
  password: string;
}

export async function loginAction(data: LoginData) {
  // 1. Pass the promise directly to safe
  // We use safe(somePromise) rather than safe(() => somePromise)
  const result = await safe(
    (async () => {
      const { email, password } = data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }

      if (!user.emailVerifiedAt) {
        throw new Error("Please verify your email before logging in.");
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        throw new Error("Invalid email or password");
      }

      const token = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(JWT_SECRET);

      const cookiesStore = await cookies();
      cookiesStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 2,
        path: "/",
      });

      // Just return a plain object
      return { authenticated: true };
    })(), // Execute the IIFE to pass the Promise
  );

  // 2. LOGIC CHECK:
  // 'safe' returns { success: true, data: { authenticated: true }, error: null }
  if (result.success) {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  // 3. Return the failure result to the frontend
  return result;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
