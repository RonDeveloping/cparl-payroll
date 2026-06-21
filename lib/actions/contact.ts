"use server";
// lib/actions/contact.ts

import { ContactFormInput } from "@/lib/validations/contact-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { upsertAddress } from "@/lib/utils/address-hash";
import { upsertEmployeePEAInternal } from "@/db/internal/employeeHelper";
import { DistributionType } from "@prisma/client";

function parseBankDetails(
  institutionNumberValue: string,
  transitAccountValue: string,
): {
  institutionNumber: number;
  branchNumber: number;
  accountNumber: string;
} | null {
  const institution = institutionNumberValue.trim();
  const transitAccount = transitAccountValue.trim();
  if (!institution || !transitAccount) return null;

  const institutionMatch = institution.match(/^(\d{3})$/);
  const transitAccountMatch = transitAccount.match(/^\d{5}[-\s]?(\d{7,12})$/);
  if (!institutionMatch || !transitAccountMatch) return null;

  return {
    institutionNumber: Number(institutionMatch[1]),
    branchNumber: Number(transitAccountMatch[1]),
    accountNumber: transitAccountMatch[2],
  };
}

/**
 * Updates an existing contact or creates a new one.
 * Returns the contact object so the frontend can redirect to the new ID.
 */
export async function upsertContactPEA(
  data: ContactFormInput,
  id: string,
  tenantId?: string,
) {
  const emailClean = data.email.trim();
  const phoneNumber = (data.phone ?? "").trim();

  return await safe(
    prisma.$transaction(async (tx) => {
      const contact = await tx.contact.upsert({
        where: { id: id === "new" || !id ? "placeholder-id" : id },
        update: {
          coreName: data.givenName,
          kindName: data.familyName,
          aliasName: data.nickName,
          displayName: data.displayName,
          subject: "INDIVIDUAL",
          source: "USER",
        },
        create: {
          coreName: data.givenName,
          kindName: data.familyName,
          aliasName: data.nickName,
          displayName: data.displayName,
          subject: "INDIVIDUAL",
          source: "USER",
        },
      });

      await tx.phone.upsert({
        where: {
          contactId_number: { contactId: contact.id, number: phoneNumber },
        },
        update: { isPrimary: true },
        create: { contactId: contact.id, number: phoneNumber, isPrimary: true },
      });

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

      await upsertAddress(tx, contact.id, {
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country,
      });

      if (tenantId) {
        const bankLabels = ["Main", "Secondary", "Auxiliary"] as const;
        const sanitizedBankAccounts = (data.bankAccounts || [])
          .map((account, index) => {
            const parsedBankDetails = parseBankDetails(
              account.institutionNumber || "",
              account.bankDetails || "",
            );
            if (!parsedBankDetails) return null;

            return {
              institutionNumber: parsedBankDetails.institutionNumber,
              branchNumber: parsedBankDetails.branchNumber,
              accountNumber: parsedBankDetails.accountNumber,
              label: bankLabels[index] || `Account ${index + 1}`,
              type: (account.distributionType ||
                "REMAINDER") as DistributionType,
              value: account.distributionValue?.trim()
                ? parseFloat(account.distributionValue.trim().replace(/,/g, ""))
                : null,
              priority: index + 1,
            };
          })
          .filter((account): account is NonNullable<typeof account> =>
            Boolean(account),
          )
          .sort((a, b) => a.priority - b.priority);

        const employee = await upsertEmployeePEAInternal(
          data,
          contact.id,
          tenantId,
          tx,
        );

        await tx.bankAccount.deleteMany({ where: { employeeId: employee.id } });

        if (sanitizedBankAccounts.length > 0) {
          await tx.bankAccount.createMany({
            data: sanitizedBankAccounts.map((account, index) => ({
              employeeId: employee.id,
              institutionNumber: account.institutionNumber,
              branchNumber: account.branchNumber,
              accountNumber: account.accountNumber,
              isPrimary: index === 0,
              isActive: true,
              type: account.type,
              priority: account.priority,
              currency: "CAD",
              label: account.label,
              value: account.value,
            })),
          });
        }
      }

      return contact;
    }),
  );
}
