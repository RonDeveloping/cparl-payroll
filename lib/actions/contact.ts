"use server";

import { ContactFormInput } from "@/lib/validations/contact-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { upsertAddress } from "@/lib/utils/address-hash";
import { DistributionType } from "@prisma/client";

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

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
  const transitAccountMatch = transitAccount.match(/^(\d{5})[-\s]?(\d{5,17})$/);
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

      // 5. EMPLOYEE UPSERT (tenant-scoped) when tenant context is provided
      if (tenantId) {
        const sinDigits = (data.sin ?? "").replace(/\D/g, "");
        const hasSin = sinDigits.length > 0;
        const parsedDob = parseIsoDate(data.dob ?? "");
        const parsedHireDate = parseIsoDate(data.hireDate ?? "");
        const parsedEmploymentEndDate = parseIsoDate(
          data.employmentEndDate ?? "",
        );
        const terminationReason = parsedEmploymentEndDate
          ? (data.terminationReason ?? null)
          : null;
        const now = new Date();
        const fallbackDob = new Date(
          now.getFullYear() - 18,
          now.getMonth(),
          now.getDate(),
        );
        const employmentProvinceCode = (
          data.employmentProvinceCode ||
          data.province ||
          "ON"
        )
          .trim()
          .toUpperCase();
        const employmentTitle = data.employmentTitle?.trim() || null;
        const employmentDepartment = data.employmentDepartment?.trim() || null;
        const jobPayRate = data.jobPayRate?.trim() || null;
        const parsedJobStartDate = parseIsoDate(data.jobStartDate ?? "");
        const parsedJobEndDate = parseIsoDate(data.jobEndDate ?? "");
        const hasJobAssignmentData = Boolean(data.jobPayType && jobPayRate);
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

        const nameCached = {
          coreName: data.givenName,
          kindName: data.familyName,
          middleName: data.middleName ?? null,
          prefix: data.prefix ?? null,
          suffix: data.suffix ?? null,
          aliasName: data.nickName ?? null,
          displayName: data.displayName ?? null,
        };

        const addressCached = {
          street: data.street ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
          postalCode: data.postalCode ?? "",
          country: data.country ?? "",
        };

        const employee = await tx.employee.upsert({
          where: {
            tenantId_contactId: {
              tenantId,
              contactId: contact.id,
            },
          },
          update: {
            employeeNumber: data.employeeNumber?.trim() || null,
            nameCached,
            addressCached,
            emailCached: emailClean || null,
            ...(parsedHireDate ? { hireDate: parsedHireDate } : {}),
            ...(data.status
              ? { status: data.status }
              : { status: "ACTIVE" as const }),
            ...(phoneNumber
              ? {
                  phoneCached: [
                    {
                      number: phoneNumber,
                      type: "MOBILE",
                      isPrimary: true,
                    },
                  ],
                }
              : {}),
            ...(parsedDob ? { dateOfBirth: parsedDob } : {}),
            ...(hasSin
              ? {
                  taxIdEncrypted: Buffer.from(sinDigits, "utf-8"),
                  taxIdLast4: sinDigits.slice(-4),
                }
              : {}),
          },
          create: {
            tenantId,
            contactId: contact.id,
            employeeNumber: data.employeeNumber?.trim() || null,
            taxIdEncrypted: Buffer.from(hasSin ? sinDigits : "", "utf-8"),
            taxIdLast4: hasSin ? sinDigits.slice(-4) : "0000",
            dateOfBirth: parsedDob ?? fallbackDob,
            hireDate: parsedHireDate ?? now,
            status: data.status || "ACTIVE",
            nameCached,
            addressCached,
            emailCached: emailClean || null,
            ...(phoneNumber
              ? {
                  phoneCached: [
                    {
                      number: phoneNumber,
                      type: "MOBILE",
                      isPrimary: true,
                    },
                  ],
                }
              : {}),
          },
        });

        const latestEmployment = await tx.employment.findFirst({
          where: {
            tenantId,
            employeeId: employee.id,
          },
          orderBy: { startDate: "desc" },
        });

        const employment = latestEmployment
          ? await tx.employment.update({
              where: { id: latestEmployment.id },
              data: {
                title: employmentTitle,
                department: employmentDepartment,
                provinceCode: employmentProvinceCode,
                ...(parsedHireDate ? { startDate: parsedHireDate } : {}),
                endDate: parsedEmploymentEndDate ?? null,
                terminationReason,
              },
            })
          : await tx.employment.create({
              data: {
                tenantId,
                employeeId: employee.id,
                title: employmentTitle,
                department: employmentDepartment,
                startDate: parsedHireDate ?? now,
                endDate: parsedEmploymentEndDate ?? null,
                terminationReason,
                provinceCode: employmentProvinceCode,
                countryCode: "CA",
              },
            });

        if (hasJobAssignmentData && jobPayRate) {
          const latestJobAssignment = await tx.jobAssignment.findFirst({
            where: { employmentId: employment.id },
            orderBy: { startDate: "desc" },
          });

          if (latestJobAssignment) {
            await tx.jobAssignment.update({
              where: { id: latestJobAssignment.id },
              data: {
                ...(parsedJobStartDate
                  ? { startDate: parsedJobStartDate }
                  : parsedHireDate
                    ? { startDate: parsedHireDate }
                    : {}),
                payType: data.jobPayType!,
                payRate: jobPayRate,
                endDate: parsedJobEndDate ?? null,
              },
            });
          } else {
            await tx.jobAssignment.create({
              data: {
                employmentId: employment.id,
                startDate:
                  parsedJobStartDate ?? parsedHireDate ?? employment.startDate,
                payType: data.jobPayType!,
                payRate: jobPayRate,
                endDate: parsedJobEndDate ?? null,
              },
            });
          }
        }

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
