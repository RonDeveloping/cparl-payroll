"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { normalizeId } from "@/utils/formatters/idSlug";
import { safe } from "@/utils/validators/safe";
import { upsertContactPEAInternal } from "@/db/internal/contactHelper";
import { UserRegistrationInput } from "../validations/user-register-schema";
import { sendVerificationEmail } from "../mail";
import crypto from "node:crypto";

export async function checkEmailAvailability(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });
  return !user; // Returns true if available
}

/**
 * Main Entry Point: Synchronizes Auth (User) and Identity (Contact/PEA).
 * Handles the "Status-Gate" by storing unverified email in 'email' field.
 */
export async function upsertUser(
  data: UserRegistrationInput,
  existingUserId?: string,
) {
  const normalizedSlug = normalizeId(data.email);
  const displayEmail = data.email.trim();

  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Resolve the target Contact ID
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

      // 2. Run the complex Contact logic (PEA = Phone, Email, Address)
      // This uses your internal helper with the address hashing
      const contact = await upsertContactPEAInternal(data, targetContactId, tx);

      // 3. Upsert the User record
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

      // --- ADDED: STEP 4 - VERIFICATION TOKEN & EMAIL TRIGGER ---

      // A. Clear any old tokens for this user (Cleanup)
      await tx.verificationToken.deleteMany({
        where: { userId: user.id },
      });

      // B. Create the new token
      const token = crypto.randomBytes(32).toString("hex");
      await tx.verificationToken.create({
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
