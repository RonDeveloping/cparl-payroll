"use server";

import { ContactFormInput } from "@/lib/validations/contact-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { upsertAddress } from "@/lib/utils/address-hash";

/**
 * Updates an existing contact or creates a new one.
 * Returns the contact object so the frontend can redirect to the new ID.
 */
export async function upsertContactPEA(data: ContactFormInput, id: string) {
  const emailClean = data.email.trim();
  const phoneNumber = (data.phone ?? "").trim();

  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. CONTACT UPSERT
      const contact = await tx.contact.upsert({
        where: { id: id === "new" || !id ? "placeholder-id" : id }, //"placeholder-id won't match a CUID for sure, which forces Prisma into the create block"
        update: {
          //if id matched in .upsert instruction
          coreName: data.givenName,
          kindName: data.familyName,
          aliasName: data.nickName,
          displayName: data.displayName,
          subject: "INDIVIDUAL",
          source: "USER",
        },
        create: {
          //if id missed in .upsert instruction
          coreName: data.givenName,
          kindName: data.familyName,
          aliasName: data.nickName,
          displayName: data.displayName,
          subject: "INDIVIDUAL",
          source: "USER",
        },
      });

      // 2. PHONE UPSERT (@@unique([contactId, phone]))
      await tx.phone.upsert({
        where: {
          contactId_number: { contactId: contact.id, number: phoneNumber },
        },
        update: { isPrimary: true },
        create: { contactId: contact.id, number: phoneNumber, isPrimary: true },
      });

      // 3. EMAIL UPSERT (@@unique([contactId, email]))
      await tx.email.upsert({
        where: {
          contactId_emailAddress: {
            contactId: contact.id,
            emailAddress: emailClean,
          },
        },
        update: { isPrimary: true },
        create: {
          contactId: contact.id,
          emailAddress: emailClean,
          isPrimary: true,
        },
      });

      // 4. ADDRESS UPSERT (using reusable utility)
      await upsertAddress(tx, contact.id, {
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country,
      });

      return contact;
    }),
  );
}
