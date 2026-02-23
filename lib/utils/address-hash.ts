import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Compute SHA256 hash of an address
 * Format: `${street}|${city}|${province}|${postalCode}|${country}` (lowercase)
 */
export const computeAddressHash = (address: {
  street?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): string => {
  const addressString = [
    address.street || "",
    address.city || "",
    address.province || "",
    address.postalCode || "",
    address.country || "",
  ]
    .join("|")
    .toLowerCase();

  return crypto.createHash("sha256").update(addressString).digest("hex");
};

/**
 * Upsert address for a contact using composite unique key (contactId, addressHash)
 * Normalizes address fields to UPPERCASE for consistency
 * Sets other addresses to non-primary before making this one primary
 */
export async function upsertAddress(
  tx: PrismaTransaction,
  contactId: string,
  address: {
    street?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  },
) {
  // Normalize to UPPERCASE
  const street = (address.street ?? "").trim().toUpperCase();
  const city = (address.city ?? "").trim().toUpperCase();
  const province = (address.province ?? "").trim().toUpperCase();
  const postalCode = (address.postalCode ?? "").trim().toUpperCase();
  const country = (address.country ?? "").trim().toUpperCase();

  // Compute hash
  const addressHash = computeAddressHash({
    street,
    city,
    province,
    postalCode,
    country,
  });

  // Set other addresses to non-primary
  await tx.address.updateMany({
    where: { contactId },
    data: { isPrimary: false },
  });

  // Upsert this address as primary
  return await tx.address.upsert({
    where: {
      contactId_addressHash: {
        contactId,
        addressHash,
      },
    },
    update: { isPrimary: true },
    create: {
      contactId,
      addressHash,
      street,
      city,
      province,
      postalCode,
      country,
      isPrimary: true,
    },
  });
}
