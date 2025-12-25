"use server";

import { ContactFormValues } from "@/lib/schemas/contact"; // Import the shared type
import prisma from "@/lib/prisma";
import { safe } from "@/utils/safe";
import crypto from "crypto";
// import { revalidatePath } from "next/cache";

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export async function createContact(data: ContactFormValues) {
  // 1. Generate the hash for the initial address
  const addressString = `${data.street}|${data.city}|${data.province}|${data.postalCode}|${data.country}`;
  const addressHash = crypto
    .createHash("sha256")
    .update(addressString)
    .digest("hex");

  return await safe(
    prisma.contact.create({
      data: {
        // Identity Fields
        givenName: data.givenName,
        familyName: data.familyName,
        nickName: data.nickName,
        displayName: data.displayName,

        // Nested Address Creation
        addresses: {
          create: {
            street: data.street,
            city: data.city,
            province: data.province,
            country: data.country,
            postalCode: data.postalCode,
            addressHash: addressHash,
            isPrimary: true,
          },
        },
      },
    })
  );
}

export async function updateContactAddress(
  contactId: string,
  data: AddressData
) {
  // 1. Create the address string for hashing as per your schema note
  // street|city|province|postalCode|country
  const addressString = `${data.street}|${data.city}|${data.province}|${data.postalCode}|${data.country}`;

  // 2. Generate SHA-256 Hash
  const newHash = crypto
    .createHash("sha256")
    .update(addressString)
    .digest("hex");

  // 3. Update the Primary Address
  return await safe(
    prisma.$transaction(async (tx) => {
      // 1. Set all current addresses for this contact to NOT primary
      // await tx.address.updateMany({
      //   where: { contactId },
      //   data: { isPrimary: false },
      // });

      // 2. UPSERT the new address based on the Hash
      // This is a true upsert
      return await tx.address.upsert({
        where: {
          contactId_addressHash: {
            contactId: contactId,
            addressHash: newHash,
          },
        },
        update: {
          ...data,
          addressHash: newHash,
          isPrimary: true,
        },
        create: {
          ...data,
          contactId,
          addressHash: newHash,
          isPrimary: true,
        },
      });
    })
  );
  // revalidatePath(`/[tenantId]/contact/${contactId}`);
}

/**
 * Updates an existing contact or creates a new one.
 * Returns the contact object so the frontend can redirect to the new ID.
 */
export async function updateOrCreateContact(
  data: ContactFormValues,
  contactId?: string
) {
  // 1. Create a hash of the address to handle the unique constraint
  const addressString =
    `${data.street}|${data.city}|${data.province}|${data.postalCode}|${data.country}`.toLowerCase();
  const addressHash = crypto
    .createHash("sha256")
    .update(addressString)
    .digest("hex");

  return await safe(
    prisma.$transaction(async (tx) => {
      // 2. IDENTITY LOGIC: Update or Create the Contact
      // We pick only identity fields to avoid Prisma errors
      const identityData = {
        givenName: data.givenName,
        familyName: data.familyName,
        nickName: data.nickName,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
      };

      let contact;

      if (contactId && contactId !== "new") {
        // Mode: UPDATE
        contact = await tx.contact.update({
          where: { id: contactId },
          data: identityData,
        });
      } else {
        // Mode: CREATE
        contact = await tx.contact.create({
          data: identityData,
        });
      }

      // 3. ADDRESS LOGIC: Manage Primary status
      // Reset all current addresses for this contact to NOT be primary
      await tx.address.updateMany({
        where: { contactId: contact.id },
        data: { isPrimary: false },
      });

      // 4. ADDRESS LOGIC: Upsert the specific address
      await tx.address.upsert({
        where: {
          contactId_addressHash: {
            contactId: contact.id,
            addressHash: addressHash,
          },
        },
        update: {
          street: data.street,
          city: data.city,
          province: data.province,
          country: data.country,
          postalCode: data.postalCode,
          isPrimary: true,
        },
        create: {
          contactId: contact.id,
          addressHash: addressHash,
          street: data.street,
          city: data.city,
          province: data.province,
          country: data.country,
          postalCode: data.postalCode,
          isPrimary: true,
        },
      });

      // 5. Return the contact object back to the Client Component
      return contact;
    })
  );
}
