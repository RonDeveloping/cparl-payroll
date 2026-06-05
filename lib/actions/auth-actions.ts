// lib/actions/auth-actions.ts
"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { sendResetEmail } from "@/lib/mail";
import { normalizeId } from "@/utils/formatters/idSlug";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";

//TODO: Move this secret to an environment variable and ensure it's a secure, random value in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_random_string_here",
);

interface LoginData {
  email: string;
  password: string;
}

export async function loginAction(data: LoginData) {
  // 1. Pass the promise directly to safe(somePromise) rather than safe(() => somePromise)
  const result = await safe(
    (async () => {
      const { email, password } = data;

      const user = await prisma.user.findUnique({
        where: { slug: normalizeId(email) },
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

      const token = await new SignJWT({ userId: user.id, slug: user.slug })
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
  redirect(ROUTES.AUTH.LOGIN);
}

export async function askForResetLinkAction(email: string) {
  return await safe(
    (async () => {
      const user = await prisma.user.findUnique({
        where: { slug: normalizeId(email) },
      });

      // Security: Don't reveal if the email doesn't exist
      if (!user) return { success: true };

      // Delete any old reset tokens first
      await prisma.authToken.deleteMany({
        where: { userId: user.id, type: "PASSWORD_RESET" },
      });

      // Create the new token
      const token = crypto.randomUUID();
      await prisma.authToken.create({
        data: {
          userId: user.id,
          token,
          type: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
        },
      });

      await sendResetEmail(user.email, token);
      return { success: true };
    })(),
  );
}

export async function resetPasswordAction(token: string, newPassword: string) {
  return await safe(
    (async () => {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      try {
        await prisma.$transaction(async (tx) => {
          const tokenRecord = await tx.authToken.findUnique({
            where: { token },
            select: {
              id: true,
              userId: true,
              type: true,
              expiresAt: true,
            },
          });

          if (
            !tokenRecord ||
            tokenRecord.type !== "PASSWORD_RESET" ||
            tokenRecord.expiresAt < new Date()
          ) {
            throw new Error("This link is invalid or has expired.");
          }

          // Consume this exact token first to enforce one-time usage.
          await tx.authToken.delete({ where: { id: tokenRecord.id } });

          await tx.user.update({
            where: { id: tokenRecord.userId },
            data: { passwordHash: hashedPassword },
          });

          // Revoke any other password-reset tokens for this user.
          await tx.authToken.deleteMany({
            where: {
              userId: tokenRecord.userId,
              type: "PASSWORD_RESET",
            },
          });
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          throw new Error("This link is invalid or has already been used.");
        }
        throw error;
      }

      return { success: true };
    })(),
  );
}

export async function validateResetTokenAction(token: string) {
  return await safe(
    (async () => {
      const tokenRecord = await prisma.authToken.findUnique({
        where: { token },
        select: {
          id: true,
          type: true,
          expiresAt: true,
        },
      });

      if (!tokenRecord || tokenRecord.type !== "PASSWORD_RESET") {
        throw new Error("This link is invalid or has already been used.");
      }

      if (tokenRecord.expiresAt < new Date()) {
        await prisma.authToken.deleteMany({
          where: { id: tokenRecord.id },
        });
        throw new Error("This link is invalid or has expired.");
      }

      return { valid: true };
    })(),
  );
}
