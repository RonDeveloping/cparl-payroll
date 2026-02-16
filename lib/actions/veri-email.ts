// lib/actions/veri-actions.ts
"use server";

import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";
import { emailSendLimit } from "../ratelimit";
import { headers } from "next/headers";

export async function verifyEmailAction(token: string) {
  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Find the token and include the user
      const tokenRecord = await tx.emailVerification.findUnique({
        where: { token },
        include: { user: true },
      });
      // 2. Validate token existence and expiration
      if (!tokenRecord) {
        throw new Error("Invalid or expired token");
      }

      if (tokenRecord.expiresAt < new Date()) {
        // Optional: delete expired token here
        await tx.emailVerification.delete({ where: { id: tokenRecord.id } });
        throw new Error(
          "Verification link has expired. Please request a new one.",
        );
      }
      const { user } = tokenRecord;

      // 3. Update the User (The Status-Gate)
      // We flip emailVerifiedAt and handle any pending email changes
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          // If the user was changing their email, apply it now
          ...(user.pendingEmail && {
            email: user.pendingEmail,
            slug: user.pendingEmail.toLowerCase().trim(),
            pendingEmail: null,
          }),
        },
      });

      // 4. Delete the token so it cannot be reused
      await tx.emailVerification.delete({
        where: { id: tokenRecord.id },
      });

      return { success: true, email: updatedUser.email };
    }),
  );
}

export async function resendVerificationEmail(email: string) {
  // 1. RATE LIMIT CHECK
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";

  const { success: limitOK } = await emailSendLimit.limit(`resend_${ip}`);

  if (!limitOK) {
    return {
      success: false,
      error: "Too many requests. Please wait a moment before trying again.",
    };
  }

  // 2. DATABASE TRANSACTION (Pure DB work)
  const dbResult = await safe(
    prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { slug: email.toLowerCase().trim() },
      });

      // If no user, return null so we can still show a generic success message
      if (!user) return null;

      // Enforce "One Active Token"
      await tx.emailVerification.deleteMany({
        where: { userId: user.id },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); //60 min expiry

      const newToken = await tx.emailVerification.create({
        data: { token, userId: user.id, expiresAt },
      });

      // Pass the data out of the transaction
      return { email: user.email, token: newToken.token };
    }),
  );

  // 3. HANDLE DB ERROR
  if (!dbResult.success) {
    return { success: false, error: "Database error. Please try again." };
  }

  // 4. ONLY TRIGGER EMAIL NOW (after the transaction is committed) to ensure we don't send emails for tokens that might later be rolled back and to avoid long-running transactions due to email sending delays or service interruptions suchas Resend server issues.
  // If dbResult.data is null, it means user wasn't found (Generic Response)
  if (dbResult.data) {
    try {
      await sendVerificationEmail(dbResult.data.email, dbResult.data.token);
    } catch (error) {
      console.error("Email failed to send:", error);
      // We don't necessarily return 'false' here because the token WAS created.
      // But for a 'resend' action, the user expects the email to work.
      return {
        success: false,
        error: "Failed to send email. Please try again.",
      };
    }
  }

  return { success: true, message: "Verification email sent." };
}
