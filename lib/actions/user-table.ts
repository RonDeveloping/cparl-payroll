// lib/actions/user.ts
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
export async function upsertUser(data: RegisterInput, existingUserId?: string) {
  const normalizedSlug = normalizeId(data.email);
  const displayEmail = data.email.trim();

  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Check for duplicate email (case-insensitive) unless updating existing user
      const existingUserByEmail = await tx.user.findFirst({
        where: {
          slug: {
            equals: normalizedSlug,
            mode: "insensitive", // Case-insensitive comparison
          },
          id: {
            not: existingUserId || "", // Exclude the current user if updating
          },
        },
        select: { id: true },
      });

      // if (existingUserByEmail) {
      //   throw new Error("This email is already registered");
      // }

      // 2. Resolve the target Contact ID
      // If we are updating an existing user, we need their current contactId
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

      // 3. Run the complex Contact logic (PEA = Phone, Email, Address)
      // This uses your internal helper with the address hashing
      const contact = await upsertContactPEAInternal(data, targetContactId, tx);

      // 4. Upsert the User record
      const hashedPassword = data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined;

      const user = await tx.user.upsert({
        where: { slug: normalizedSlug },
        update: {
          ...(hashedPassword && { passwordHash: hashedPassword }),
          // Ensure the user is linked to the contact we just processed
          contactId: contact.id,
        },
        create: {
          slug: normalizedSlug,
          email: displayEmail, // Primary email for account resets
          passwordHash: hashedPassword || null,
          contactId: contact.id,
          emailVerifiedAt: null, // Status-Gate: Start unverified
          pendingEmail: null, // Only used for future change-requests
        },
      });

      // --- ADDED: STEP 5 - VERIFICATION TOKEN & EMAIL TRIGGER ---

      // A. Clear any old tokens for this user (Cleanup)
      await tx.emailVerification.deleteMany({
        where: { userId: user.id },
      });

      // B. Create the new token
      const token = crypto.randomBytes(32).toString("hex");
      await tx.emailVerification.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // C. Send the email!
      await sendVerificationEmail(user.email, token);

      return { user, contact };
    }),
  );
}
