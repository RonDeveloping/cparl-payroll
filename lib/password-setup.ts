import crypto from "node:crypto";
import { Client } from "pg";

import { Prisma } from "@prisma/client";

import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";
import { sendSetupPasswordEmail, sendVerificationEmail } from "@/lib/mail";
import { ROUTES } from "@/constants/routes";

export type PasswordSetupLinkResult =
  | { success: true; email: string }
  | {
      success: false;
      error: string;
      reason:
        | "not-found"
        | "not-verified"
        | "already-has-password"
        | "send-failed";
    };

const PASSWORD_SETUP_TOKEN_TTL_MS = 60 * 60 * 1000;

async function issueVerificationLinkForEmail(emailRaw: string) {
  const normalizedEmail = emailRaw.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const existing = await prisma.verificationEmailToken.findFirst({
    where: { email: normalizedEmail },
  });

  if (existing) {
    await prisma.verificationEmailToken.update({
      where: { id: existing.id },
      data: { token, expiresAt },
    });
  } else {
    await prisma.verificationEmailToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });
  }

  await sendVerificationEmail(normalizedEmail, token, new Date());
  return normalizedEmail;
}

export async function consumeSetupPasswordToken(
  token: string,
): Promise<PasswordSetupLinkResult> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const result = await client.query<{
      id: string;
      expiresAt: Date;
      email: string;
      emailVerifiedAt: Date | null;
      passwordHash: string | null;
    }>(
      `SELECT
        at.id,
        at.expires_at AS "expiresAt",
        u.email,
        u.email_verified_at AS "emailVerifiedAt",
        u.password_hash AS "passwordHash"
      FROM auth_token AS at
      INNER JOIN "user" AS u ON u.id = at.user_id
      WHERE at.token = $1
      LIMIT 1`,
      [token],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        error: "Invalid token.",
        reason: "not-found",
      };
    }

    if (row.expiresAt < new Date()) {
      await client.query(`DELETE FROM auth_token WHERE id = $1`, [row.id]);
      return {
        success: false,
        error: "Verification link has expired; please request a new one.",
        reason: "not-found",
      };
    }

    if (!row.emailVerifiedAt || row.passwordHash) {
      await client.query(`DELETE FROM auth_token WHERE id = $1`, [row.id]);
      return {
        success: false,
        error: "Invalid token.",
        reason: "already-has-password",
      };
    }

    await client.query(`DELETE FROM auth_token WHERE id = $1`, [row.id]);

    return { success: true, email: row.email.toLowerCase().trim() };
  } catch (error) {
    console.error("[consumeSetupPasswordToken] failed", error);
    return {
      success: false,
      error: "Internal server error.",
      reason: "send-failed",
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function generatePasswordSetupToken(
  userId: string,
  userEmail: string,
): Promise<string> {
  await prisma.authToken.deleteMany({
    where: { userId, type: "SETUP_PASSWORD" },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_SETUP_TOKEN_TTL_MS);

  await prisma.authToken.create({
    data: { token, userId, type: "SETUP_PASSWORD", expiresAt },
  });

  return `${ROUTES.AUTH.SETUP_PASSWORD}?token=${token}&email=${encodeURIComponent(userEmail)}`;
}

export async function issuePasswordSetupLink(
  emailRaw: string,
): Promise<PasswordSetupLinkResult> {
  const normalizedEmail = emailRaw.toLowerCase().trim();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { slug: normalizedEmail },
          { email: { equals: normalizedEmail, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      const email = await issueVerificationLinkForEmail(normalizedEmail);
      return { success: true, email };
    }

    if (!user.emailVerifiedAt) {
      const email = await issueVerificationLinkForEmail(normalizedEmail);
      return { success: true, email };
    }

    if (user.passwordHash) {
      return {
        success: false,
        error: "This account already has a password. Please log in instead.",
        reason: "already-has-password",
      };
    }

    await prisma.authToken.deleteMany({
      where: { userId: user.id, type: "SETUP_PASSWORD" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_SETUP_TOKEN_TTL_MS);

    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
        type: "SETUP_PASSWORD",
        expiresAt,
      },
    });

    try {
      await sendSetupPasswordEmail(user.email, token);
    } catch (error) {
      console.error("[issuePasswordSetupLink] email send failed", error);
      await prisma.authToken.deleteMany({ where: { token } });

      return {
        success: false,
        error: ERRORS.FAILED_TO_SEND_EMAIL,
        reason: "send-failed",
      };
    }

    return { success: true, email: user.email };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[issuePasswordSetupLink] prisma error", error);
      return {
        success: false,
        error: ERRORS.DATABASE_ERROR,
        reason: "send-failed",
      };
    }

    console.error("[issuePasswordSetupLink] failed", error);
    return {
      success: false,
      error: ERRORS.INTERNAL_SERVER_ERROR,
      reason: "send-failed",
    };
  }
}
