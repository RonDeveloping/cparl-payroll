"use server";

import { ContactFormValues } from "@/lib/validations/contact";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import crypto from "crypto";
// import { number } from "zod";

/**
 * Updates an existing contact or creates a new one.
 * Returns the contact object so the frontend can redirect to the new ID.
 */
export async function upsertContactPEA(data: ContactFormValues, id: string) {
  // 1. NORMALIZE EVERYTHING (as case sensitive crucial for hashes)
  const street = (data.street ?? "").trim().toUpperCase();
  const city = (data.city ?? "").trim().toUpperCase();
  const province = (data.province ?? "").trim().toUpperCase();
  const postal = (data.postalCode ?? "").trim().toUpperCase();
  const country = (data.country ?? "").trim().toUpperCase();
  //extract to a variable and then hash to maintain consistency
  const addressString =
    `${street}|${city}|${province}|${postal}|${country}`.toLowerCase();
  const addressHash = crypto
    .createHash("sha256")
    .update(addressString)
    .digest("hex");

  const emailClean = data.email.toLowerCase().trim();
  const phoneNumber = (data.phone ?? "").trim();

  return await safe(
    prisma.$transaction(async (tx) => {
      // 2. CONTACT UPSERT
      const contact = await tx.contact.upsert({
        where: { id: id === "new" || !id ? "placeholder-id" : id }, //"placeholder-id won't match a CUID for sure, which forces Prisma into the create block"
        update: {
          //if id matched in .upsert instruction
          givenName: data.givenName,
          familyName: data.familyName,
          nickName: data.nickName,
          displayName: data.displayName,
        },
        create: {
          //if id missed in .upsert instruction
          givenName: data.givenName,
          familyName: data.familyName,
          nickName: data.nickName,
          displayName: data.displayName,
        },
      });

      // 3. PHONE UPSERT (@@unique([contactId, phone]))
      await tx.phone.upsert({
        where: {
          contactId_number: { contactId: contact.id, number: phoneNumber },
        },
        update: { isPrimary: true },
        create: { contactId: contact.id, number: phoneNumber, isPrimary: true },
      });

      // 4. EMAIL UPSERT (@@unique([contactId, email]))
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

      // 5. ADDRESS UPSERT (@@unique([contactId, addressHash]))
      // First, set others to false
      await tx.address.updateMany({
        where: { contactId: contact.id },
        data: { isPrimary: false },
      });

      await tx.address.upsert({
        where: {
          contactId_addressHash: {
            contactId: contact.id,
            addressHash: addressHash,
          },
        },
        update: { isPrimary: true },
        create: {
          contactId: contact.id,
          addressHash: addressHash,
          street,
          city,
          province,
          country,
          postalCode: postal,
          isPrimary: true,
        },
      });

      return contact;
    }),
  );
}
