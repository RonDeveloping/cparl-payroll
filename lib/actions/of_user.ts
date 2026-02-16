// lib/actions/of_user.ts
"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { normalizeId } from "@/utils/formatters/idSlug";
import { safe } from "@/utils/validators/safe";
import { upsertContactPEAInternal } from "@/db/internal/contactHelper";
import { RegisterInput } from "../validations/register-schema";
import { sendVerificationEmail } from "../mail";
import crypto from "node:crypto";

export async function isEmailTaken(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const isEmailInUserTable = await prisma.user.findFirst({
    where: {
      slug: {
        equals: normalizedEmail,
        mode: "insensitive", // Case-insensitive search
      },
    },
    select: { id: true },
  });
  return isEmailInUserTable; // Returns true if taken, false if available
}

/**
 * Main Entry Point: Synchronizes Auth (User) and Identity (Contact/PEA).
 * Handles the "Status-Gate" by storing unverified email in 'email' field.
 */
export async function upSertUserSendEmailVeriRequest(
  data: RegisterInput,
  existingUserId?: string,
) {
  const normalizedSlug = normalizeId(data.email);
  const displayEmail = data.email.trim();
  const phone = data.phone ? data.phone.trim() : null;

  // 1. DATABASE TRANSACTION
  const dbResult = await safe(
    prisma.$transaction(async (tx) => {
      let targetContactId = "new";
      let userToUpdate = null;

      if (existingUserId) {
        userToUpdate = await tx.user.findUnique({
          where: { id: existingUserId },
        });
        if (userToUpdate?.contactId) {
          targetContactId = userToUpdate.contactId;
        }
      }

      const contact = await upsertContactPEAInternal(data, targetContactId, tx);

      const hashedPassword = data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined;

      const user = await tx.user.upsert({
        where: { slug: normalizedSlug },
        update: {
          ...(hashedPassword && { passwordHash: hashedPassword }),
          contactId: contact.id,
        },
        create: {
          slug: normalizedSlug,
          email: displayEmail,
          phone: phone,
          passwordHash: hashedPassword || null,
          contactId: contact.id,
          emailVerifiedAt: null,
          pendingEmail: null,
        },
      });

      // Cleanup old tokens
      await tx.emailVerification.deleteMany({
        where: { userId: user.id },
      });

      // Create new token
      const token = crypto.randomBytes(32).toString("hex");
      await tx.emailVerification.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
        },
      });

      // Return everything needed for the UI and the email trigger
      return { user, contact, token };
    }),
  );

  // 2. CHECK DB SUCCESS
  if (!dbResult.success) {
    return { success: false, error: "Registration failed. Please try again." };
  }

  // 3. TRIGGER EMAIL (Now safely outside the transaction)
  try {
    const { user, token } = dbResult.data;
    await sendVerificationEmail(user.email, token);
  } catch (error) {
    // We log the error but don't fail the whole registration
    // because the user account was successfully created/updated in the DB.
    console.error("Post-Registration Email failed:", error);

    // Optional: Return a specific flag so the UI can tell the user
    // "Account created, but we couldn't send the email right now."
    return {
      success: true,
      data: dbResult.data,
      warning:
        "Account created, but email delivery failed. Please try resending.",
    };
  }

  return { success: true, data: dbResult.data };
}
