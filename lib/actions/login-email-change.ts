"use server";
// lib/actions/login-email-change.ts

import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/db/prismaDrizzle";
import { getSessionClaims } from "@/lib/session";
import { sendLoginEmailChangeNotice, sendVerificationEmail } from "@/lib/mail";
import { ERRORS } from "@/constants/errors";
import { ROUTES } from "@/constants/routes";
import { hasAcceptedCurrentTerms } from "@/constants/terms";
import { dashboardContent } from "@/constants/content";
import { loginEmailChangeLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const simpleEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_EMAIL_CHANGE_RESPONSE_MS = 900;

export async function requestLoginEmailChange(
  newEmailRaw: string,
  currentPasswordRaw: string,
) {
  const startedAt = Date.now();
  const respond = async <T extends { success: boolean }>(payload: T) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_EMAIL_CHANGE_RESPONSE_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_EMAIL_CHANGE_RESPONSE_MS - elapsed),
      );
    }
    return payload;
  };

  try {
    const session = await getSessionClaims();
    if (!session?.userId) {
      return await respond({
        success: false,
        error: ERRORS.UNAUTHORIZED,
      } as const);
    }

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";

    const { success: userLimitOk } = await loginEmailChangeLimit.limit(
      `login_email_change_user_${session.userId}`,
    );
    const { success: ipLimitOk } = await loginEmailChangeLimit.limit(
      `login_email_change_ip_${ip}`,
    );

    if (!userLimitOk || !ipLimitOk) {
      return await respond({
        success: false,
        error: ERRORS.TOO_MANY_REQUESTS,
      } as const);
    }

    const normalizedEmail = newEmailRaw.toLowerCase().trim();
    const currentPassword = currentPasswordRaw.trim();
    if (!simpleEmailPattern.test(normalizedEmail)) {
      return await respond({
        success: false,
        error: ERRORS.INVALID_EMAIL,
      } as const);
    }
    if (!currentPassword) {
      return await respond({
        success: false,
        error: ERRORS.REAUTH_REQUIRED,
      } as const);
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        termsAcceptedAt: true,
        termsVersionAccepted: true,
      },
    });

    if (!currentUser) {
      return await respond({
        success: false,
        error: ERRORS.UNAUTHORIZED,
      } as const);
    }

    if (!currentUser.passwordHash) {
      return await respond({
        success: false,
        error: ERRORS.REAUTH_REQUIRED,
      } as const);
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      currentUser.passwordHash,
    );
    if (!passwordMatches) {
      return await respond({
        success: false,
        error: ERRORS.REAUTH_REQUIRED,
      } as const);
    }

    if (
      !hasAcceptedCurrentTerms(
        currentUser.termsAcceptedAt,
        currentUser.termsVersionAccepted,
      )
    ) {
      return await respond({
        success: false,
        error:
          "Please accept the latest terms and conditions before changing login email.",
      } as const);
    }

    const currentNormalized = currentUser.email.toLowerCase().trim();
    if (normalizedEmail === currentNormalized) {
      return await respond({
        success: false,
        error: "New email matches your current login email.",
      } as const);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { slug: normalizedEmail },
          { email: { equals: normalizedEmail, mode: "insensitive" } },
        ],
        NOT: { id: currentUser.id },
      },
      select: { id: true },
    });

    if (existingUser) {
      return await respond({
        success: true,
        message:
          dashboardContent.profileInlineEditor.loginEmailRequestAcknowledgement,
      } as const);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.authToken.deleteMany({
        where: {
          userId: currentUser.id,
          type: "EMAIL_VERIFICATION",
        },
      });

      await tx.user.update({
        where: { id: currentUser.id },
        data: { candidateEmail: normalizedEmail },
      });

      await tx.authToken.create({
        data: {
          token,
          userId: currentUser.id,
          type: "EMAIL_VERIFICATION",
          expiresAt,
        },
      });
    });

    try {
      await sendVerificationEmail(
        normalizedEmail,
        token,
        createdAt,
        ROUTES.AUTH.CONFIRM_EMAIL_CHANGE,
      );
    } catch (error) {
      console.error(
        "[requestLoginEmailChange] verification email failed",
        error,
      );
      // Keep response generic to avoid making delivery behavior observable.
    }

    try {
      await sendLoginEmailChangeNotice(currentUser.email, normalizedEmail);
    } catch (error) {
      console.error("[requestLoginEmailChange] old-email notice failed", error);
    }

    return await respond({
      success: true,
      message:
        dashboardContent.profileInlineEditor.loginEmailRequestAcknowledgement,
    } as const);
  } catch (error) {
    console.error("[requestLoginEmailChange] failed", error);
    return await respond({
      success: false,
      error: ERRORS.INTERNAL_SERVER_ERROR,
    } as const);
  }
}
