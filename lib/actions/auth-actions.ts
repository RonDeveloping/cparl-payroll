"use server";
// lib/actions/auth-actions.ts

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { cookies, headers } from "next/headers";
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
const LOGIN_2FA_MAX_ATTEMPTS = 5;
const LOGIN_2FA_LOCKOUT_MS = 15 * 60 * 1000;
const TRUSTED_2FA_DEVICE_COOKIE = "trusted_2fa_device";
const TRUSTED_2FA_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 40;

type Login2FAChallenge = {
  userId: string;
  attempts: number;
  lockoutUntil: number | null;
};

type NetworkRiskSignals = {
  countryCode: string | null;
  asn: string | null;
  latitude: number | null;
  longitude: number | null;
};

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeIp(rawIp: string) {
  const trimmed = rawIp.trim().replace(/^::ffff:/, "");

  if (/^\d+\.\d+\.\d+\.\d+$/.test(trimmed)) {
    const parts = trimmed.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  if (trimmed.includes(":")) {
    return trimmed.split(":").slice(0, 4).join(":");
  }

  return trimmed;
}

function isPrivateOrUnknownIp(ip: string) {
  if (!ip || ip === "unknown-ip") return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;

  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!v4) return false;

  const a = Number(v4[1]);
  const b = Number(v4[2]);

  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

async function getNetworkRiskSignals(ip: string): Promise<NetworkRiskSignals> {
  if (isPrivateOrUnknownIp(ip)) {
    return {
      countryCode: null,
      asn: null,
      latitude: null,
      longitude: null,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        countryCode: null,
        asn: null,
        latitude: null,
        longitude: null,
      };
    }

    const payload = (await response.json()) as {
      success?: boolean;
      country_code?: unknown;
      latitude?: unknown;
      longitude?: unknown;
      connection?: { asn?: unknown };
    };

    if (payload.success === false) {
      return {
        countryCode: null,
        asn: null,
        latitude: null,
        longitude: null,
      };
    }

    const countryCode =
      typeof payload.country_code === "string" ? payload.country_code : null;
    const asn =
      typeof payload.connection?.asn === "number" ||
      typeof payload.connection?.asn === "string"
        ? String(payload.connection?.asn)
        : null;
    const latitude =
      typeof payload.latitude === "number" ? payload.latitude : null;
    const longitude =
      typeof payload.longitude === "number" ? payload.longitude : null;

    return { countryCode, asn, latitude, longitude };
  } catch {
    return {
      countryCode: null,
      asn: null,
      latitude: null,
      longitude: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const earthKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthKm * c;
}

async function getRequestFingerprint() {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") || "unknown-user-agent";
  const forwardedIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0] ||
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("x-real-ip") ||
    "unknown-ip";

  const normalizedIp = normalizeIp(forwardedIp);

  return {
    uaHash: hashValue(userAgent),
    ipHash: hashValue(normalizedIp),
    normalizedIp,
  };
}

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

async function issueLogin2FAChallengeCookie(
  userId: string,
  attempts = 0,
  lockoutUntil: number | null = null,
) {
  const challengeToken = await new SignJWT({
    userId,
    purpose: "login-2fa",
    attempts,
    lockoutUntil,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(LOGIN_2FA_COOKIE, challengeToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
    path: "/",
  });
}

async function issueTrusted2FADeviceCookie(userId: string) {
  const { uaHash, ipHash, normalizedIp } = await getRequestFingerprint();
  const riskSignals = await getNetworkRiskSignals(normalizedIp);

  const trustedToken = await new SignJWT({
    userId,
    purpose: "trusted-2fa-device",
    uaHash,
    ipHash,
    countryCode: riskSignals.countryCode,
    asn: riskSignals.asn,
    latitude: riskSignals.latitude,
    longitude: riskSignals.longitude,
    riskCapturedAt: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("40d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(TRUSTED_2FA_DEVICE_COOKIE, trustedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TRUSTED_2FA_DEVICE_MAX_AGE_SECONDS,
    path: "/",
  });
}

async function hasValidTrusted2FADevice(userId: string) {
  const cookieStore = await cookies();
  const trustedToken = cookieStore.get(TRUSTED_2FA_DEVICE_COOKIE)?.value;

  if (!trustedToken) return false;

  try {
    const { payload } = await jwtVerify(trustedToken, JWT_SECRET);

    if (payload.purpose !== "trusted-2fa-device" || payload.userId !== userId) {
      return false;
    }

    if (
      typeof payload.uaHash !== "string" ||
      typeof payload.ipHash !== "string"
    ) {
      return false;
    }

    const { uaHash, ipHash, normalizedIp } = await getRequestFingerprint();

    if (payload.uaHash !== uaHash || payload.ipHash !== ipHash) {
      return false;
    }

    const currentRisk = await getNetworkRiskSignals(normalizedIp);

    const trustedCountry =
      typeof payload.countryCode === "string" ? payload.countryCode : null;
    const trustedAsn = typeof payload.asn === "string" ? payload.asn : null;

    if (
      trustedCountry &&
      currentRisk.countryCode &&
      trustedCountry !== currentRisk.countryCode
    ) {
      return false;
    }

    if (trustedAsn && currentRisk.asn && trustedAsn !== currentRisk.asn) {
      return false;
    }

    const trustedLatitude =
      typeof payload.latitude === "number" ? payload.latitude : null;
    const trustedLongitude =
      typeof payload.longitude === "number" ? payload.longitude : null;
    const trustedCapturedAt =
      typeof payload.riskCapturedAt === "number"
        ? payload.riskCapturedAt
        : null;

    if (
      trustedLatitude !== null &&
      trustedLongitude !== null &&
      currentRisk.latitude !== null &&
      currentRisk.longitude !== null &&
      trustedCapturedAt !== null
    ) {
      const hoursSinceCapture =
        (Date.now() - trustedCapturedAt) / (1000 * 60 * 60);

      if (hoursSinceCapture > 0) {
        const distanceKm = haversineKm(
          trustedLatitude,
          trustedLongitude,
          currentRisk.latitude,
          currentRisk.longitude,
        );

        const requiredTravelSpeedKmH = distanceKm / hoursSinceCapture;
        if (requiredTravelSpeedKmH > 900) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

async function getLogin2FAChallengeFromCookie(): Promise<Login2FAChallenge> {
  const cookieStore = await cookies();
  const challengeToken = cookieStore.get(LOGIN_2FA_COOKIE)?.value;

  if (!challengeToken) {
    throw new Error("Your login session expired. Please sign in again.");
  }

  try {
    const { payload } = await jwtVerify(challengeToken, JWT_SECRET);
    const purpose = payload.purpose;
    const userId = payload.userId;
    const attempts =
      typeof payload.attempts === "number" && payload.attempts >= 0
        ? payload.attempts
        : 0;
    const lockoutUntil =
      typeof payload.lockoutUntil === "number" ? payload.lockoutUntil : null;

    if (purpose !== "login-2fa" || typeof userId !== "string") {
      throw new Error("Invalid login challenge.");
    }

    return { userId, attempts, lockoutUntil };
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

      const isTrustedDevice = await hasValidTrusted2FADevice(user.id);

      if (isTrustedDevice) {
        await issueSessionCookie(user.id, user.slug);
        return {
          authenticated: true,
          requiresTwoFactor: false,
        };
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

      const challenge = await getLogin2FAChallengeFromCookie();
      const userId = challenge.userId;

      if (challenge.lockoutUntil && Date.now() < challenge.lockoutUntil) {
        const remainingMinutes = Math.max(
          1,
          Math.ceil((challenge.lockoutUntil - Date.now()) / (1000 * 60)),
        );
        throw new Error(
          `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
        );
      }

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
        const nextAttempts = challenge.attempts + 1;

        if (nextAttempts >= LOGIN_2FA_MAX_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOGIN_2FA_LOCKOUT_MS;
          await issueLogin2FAChallengeCookie(
            userId,
            nextAttempts,
            lockoutUntil,
          );
          throw new Error(
            "Too many failed attempts. Verification is temporarily locked for 15 minutes.",
          );
        }

        await issueLogin2FAChallengeCookie(userId, nextAttempts, null);
        const attemptsRemaining = LOGIN_2FA_MAX_ATTEMPTS - nextAttempts;
        throw new Error(
          `Invalid code. ${attemptsRemaining} attempt(s) remaining before lockout.`,
        );
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

      await issueTrusted2FADeviceCookie(user.id);
      await issueSessionCookie(user.id, user.slug);

      return { authenticated: true };
    })(),
  );
}

export async function resendLogin2FAAction() {
  return await safe(
    (async () => {
      const challenge = await getLogin2FAChallengeFromCookie();
      const userId = challenge.userId;

      if (challenge.lockoutUntil && Date.now() < challenge.lockoutUntil) {
        const remainingMinutes = Math.max(
          1,
          Math.ceil((challenge.lockoutUntil - Date.now()) / (1000 * 60)),
        );
        throw new Error(
          `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      await createAndSendLogin2FACode(userId, user.email);
      await issueLogin2FAChallengeCookie(userId, 0, null);

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
