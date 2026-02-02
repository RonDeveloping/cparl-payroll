"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import { normalizeId } from "@/utils/formatters/idSlug";
import { safe } from "@/utils/validators/safe";
import { upsertContactPEAInternal } from "@/db/internal/contactHelper";

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
  data: ContactFormInput,
  password?: string,
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
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
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

      return { user, contact };
    }),
  );
}
