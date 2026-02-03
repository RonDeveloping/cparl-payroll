// lib/actions/veri-actions.ts
"use server";

import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function verifyEmailAction(token: string) {
  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Find the token and include the user
      const tokenRecord = await tx.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });
      // 2. Validate token existence and expiration
      if (!tokenRecord) {
        throw new Error("Invalid or expired token");
      }

      if (tokenRecord.expiresAt < new Date()) {
        // Optional: delete expired token here
        await tx.verificationToken.delete({ where: { id: tokenRecord.id } });
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

      // 4. Sync the Contact Table
      // Ensure the "Shared Kernel" identity matches the verified auth email
      // if (user.contactId) {
      //   await tx.contact.update({
      //     where: { id: user.contactId },
      //     data: {
      //       email: updatedUser.email,
      //     },
      //   });
      // }

      // 5. Delete the token so it cannot be reused
      await tx.verificationToken.delete({
        where: { id: tokenRecord.id },
      });

      return { success: true, email: updatedUser.email };
    }),
  );
}

export async function resendVerification(email: string) {
  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Find the user by email or slug
      const user = await tx.user.findFirst({
        where: {
          OR: [{ email: email.trim() }, { slug: email.toLowerCase().trim() }],
        },
      });

      if (!user) {
        // For security, you might want to return "Success" even if user not found
        // to prevent email enumeration, but for now we'll throw an error.
        throw new Error("User not found.");
      }

      // 2. Enforce "One Active Token" - Delete old tokens for this user
      await tx.verificationToken.deleteMany({
        where: { userId: user.id },
      });

      // 3. Generate a new secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

      const newToken = await tx.verificationToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // 4. TRIGGER EMAIL SEND
      await sendVerificationEmail(user.email, token);

      return { success: true, message: "Verification email sent." };
    }),
  );
}
