"use server";
// lib/actions/auth-actions.ts

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { sendLoginTwoFactorCodeEmail, sendResetEmail } from "@/lib/mail";
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

const LOGIN_2FA_COOKIE = "login_2fa";
const LOGIN_2FA_CODE_TTL_MS = 10 * 60 * 1000;

async function issueSessionCookie(userId: string, slug: string) {
  const token = await new SignJWT({ userId, slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2,
    path: "/",
  });
}

async function issueLogin2FAChallengeCookie(userId: string) {
  const challengeToken = await new SignJWT({
    userId,
    purpose: "login-2fa",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(LOGIN_2FA_COOKIE, challengeToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
}

async function getLogin2FAUserIdFromCookie() {
  const cookieStore = await cookies();
  const challengeToken = cookieStore.get(LOGIN_2FA_COOKIE)?.value;

  if (!challengeToken) {
    throw new Error("Your login session expired. Please sign in again.");
  }

  try {
    const { payload } = await jwtVerify(challengeToken, JWT_SECRET);
    const purpose = payload.purpose;
    const userId = payload.userId;

    if (purpose !== "login-2fa" || typeof userId !== "string") {
      throw new Error("Invalid login challenge.");
    }

    return userId;
  } catch {
    throw new Error("Your login session expired. Please sign in again.");
  }
}

async function createAndSendLogin2FACode(userId: string, email: string) {
  const code = crypto.randomInt(0, 100_000).toString().padStart(5, "0");
  const expiresAt = new Date(Date.now() + LOGIN_2FA_CODE_TTL_MS);

  await prisma.twoFactorCode.upsert({
    where: { userId },
    update: { code, expiresAt },
    create: { userId, code, expiresAt },
  });

  await sendLoginTwoFactorCodeEmail(email, code, expiresAt);
}

export async function loginAction(data: LoginData) {
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

      await createAndSendLogin2FACode(user.id, user.email);
      await issueLogin2FAChallengeCookie(user.id);

      return {
        requiresTwoFactor: true,
        email: user.email,
      };
    })(),
  );

  return result;
}

export async function verifyLogin2FAAction(code: string) {
  return await safe(
    (async () => {
      const normalizedCode = code.trim();
      if (!/^\d{5}$/.test(normalizedCode)) {
        throw new Error("Enter the 5-digit code from your email.");
      }

      const userId = await getLogin2FAUserIdFromCookie();

      const entry = await prisma.twoFactorCode.findUnique({
        where: { userId },
        select: {
          id: true,
          code: true,
          expiresAt: true,
        },
      });

      if (!entry || entry.expiresAt < new Date()) {
        await prisma.twoFactorCode.deleteMany({ where: { userId } });
        throw new Error("Code expired. Request a new one.");
      }

      if (entry.code !== normalizedCode) {
        throw new Error("Invalid code.");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, slug: true },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      await prisma.$transaction([
        prisma.twoFactorCode.delete({ where: { id: entry.id } }),
        prisma.user.update({
          where: { id: user.id },
          data: { last2FAAt: new Date() },
        }),
      ]);

      const cookieStore = await cookies();
      cookieStore.delete(LOGIN_2FA_COOKIE);

      await issueSessionCookie(user.id, user.slug);

      return { authenticated: true };
    })(),
  );
}

export async function resendLogin2FAAction() {
  return await safe(
    (async () => {
      const userId = await getLogin2FAUserIdFromCookie();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      await createAndSendLogin2FACode(userId, user.email);

      return { resent: true };
    })(),
  );
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete(LOGIN_2FA_COOKIE);
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
