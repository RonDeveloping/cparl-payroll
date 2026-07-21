"use server";
// lib/actions/tenant.ts

/**
 * Tenant server actions for employer lifecycle management.
 *
 * This module handles:
 * - Creating/updating tenants, related contact records, and address data
 * - Initial payroll setup (payroll unit and pay schedule)
 * - Owner/member assignment during onboarding
 * - Owner-gated activation/deactivation and safe deletion checks
 */

import { TenantFormInput } from "@/lib/validations/tenant-schema";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { getSession } from "@/lib/session";
import {
  generateTenantSlug,
  trimDuplicateEnding,
} from "@/utils/formatters/slugify";
import { upsertAddress } from "@/lib/utils/address-hash";
import { splitBusinessNumber } from "@/utils/formatters/businessNumber";
import { ERRORS } from "@/constants/errors";
import { DEFAULT_EARNING_CODES } from "@/constants/earning-types";

function formatPayFrequencyName(
  frequency: TenantFormInput["payFrequency"],
): string | null {
  switch (frequency) {
    case "MONTHLY":
      return "Monthly";
    case "SEMIMONTHLY":
      return "Semi-monthly";
    case "BIWEEKLY":
      return "Biweekly";
    case "WEEKLY":
      return "Weekly";
    default:
      return null;
  }
}

function normalizePayrollUnitName(name: string): string {
  return name.trim().toLowerCase();
}

function buildUniquePayrollUnitName(
  baseName: string,
  existingNames: string[],
): string {
  const trimmedBaseName = baseName.trim();
  const normalizedNames = new Set(
    existingNames.map((existingName) => normalizePayrollUnitName(existingName)),
  );

  let suffix = 0;
  let candidateName = trimmedBaseName;

  while (normalizedNames.has(normalizePayrollUnitName(candidateName))) {
    suffix += 1;
    candidateName = `${trimmedBaseName} ${suffix}`;
  }

  return candidateName;
}

/**
 * Updates an existing tenant or creates a new one.
 */
export async function upsertTenant(data: TenantFormInput, id?: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: ERRORS.UNAUTHORIZED } as const;
  }

  // Trim coreName if it ends with legalNameEnding to avoid duplication
  const trimmedCoreName = trimDuplicateEnding(
    data.coreName,
    data.legalNameEnding,
  );

  // Generate slug from trimmed coreName and legalNameEnding
  const generatedSlug = generateTenantSlug(
    trimmedCoreName,
    data.legalNameEnding,
  );
  const memberEmailList = (data.memberEmails ?? "")
    .split(/[,;\n]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const normalizedPayScheduleCode =
    data.payScheduleCode?.trim().toUpperCase() || null;

  return await safe(
    prisma.$transaction(async (tx) => {
      // Check if slug is already taken (if creating or slug changed)
      if (!id || id === "new") {
        const existingSlug = await tx.tenant.findUnique({
          where: { slug: generatedSlug },
        });
        if (existingSlug) {
          throw new Error(ERRORS.SLUG_TAKEN);
        }
      } else {
        const existingSlug = await tx.tenant.findFirst({
          where: {
            slug: generatedSlug,
            NOT: { id },
          },
        });
        if (existingSlug) {
          throw new Error(ERRORS.SLUG_TAKEN);
        }
      }

      // Create or update Organization Contact record (for address storage)
      let contactId: string;
      let contactForCache: {
        coreName: string;
        kindName: string;
        middleName: string | null;
        prefix: string | null;
        suffix: string | null;
        aliasName: string | null;
        displayName: string | null;
      } | null = null;

      if (!id || id === "new") {
        // Create new organization contact for new tenant
        const contact = await tx.contact.create({
          data: {
            coreName: trimmedCoreName,
            kindName: data.legalNameEnding || "",
            aliasName: data.operatingName ?? null,
            subject: "ORGANIZATION",
            source: "USER",
          },
        });
        contactId = contact.id;
        contactForCache = {
          coreName: contact.coreName,
          kindName: contact.kindName,
          middleName: contact.middleName,
          prefix: contact.prefix,
          suffix: contact.suffix,
          aliasName: contact.aliasName,
          displayName: contact.displayName,
        };

        // Save mailing address
        if (data.address && Object.values(data.address).some((v) => v)) {
          await upsertAddress(tx, contact.id, data.address);
        }
      } else {
        // Update existing organization contact
        const existingTenant = await tx.tenant.findUnique({
          where: { id },
        });

        if (existingTenant && existingTenant.contactId) {
          const contact = await tx.contact.update({
            where: { id: existingTenant.contactId },
            data: {
              coreName: trimmedCoreName,
              kindName: data.legalNameEnding || "",
              aliasName: data.operatingName ?? null,
            },
          });
          contactForCache = {
            coreName: contact.coreName,
            kindName: contact.kindName,
            middleName: contact.middleName,
            prefix: contact.prefix,
            suffix: contact.suffix,
            aliasName: contact.aliasName,
            displayName: contact.displayName,
          };

          // Update mailing address
          if (data.address && Object.values(data.address).some((v) => v)) {
            await upsertAddress(tx, existingTenant.contactId, data.address);
          }

          contactId = existingTenant.contactId;
        } else {
          const contact = await tx.contact.create({
            data: {
              coreName: trimmedCoreName,
              kindName: data.legalNameEnding || "",
              aliasName: data.operatingName ?? null,
              subject: "ORGANIZATION",
              source: "USER",
            },
          });

          if (data.address && Object.values(data.address).some((v) => v)) {
            await upsertAddress(tx, contact.id, data.address);
          }

          contactId = contact.id;
          contactForCache = {
            coreName: contact.coreName,
            kindName: contact.kindName,
            middleName: contact.middleName,
            prefix: contact.prefix,
            suffix: contact.suffix,
            aliasName: contact.aliasName,
            displayName: contact.displayName,
          };
        }
      }

      // Create or update Contact Person record (separate from organization contact)
      let primaryContactPersonId: string | null = null;
      const firstName = (data.contactFirstName ?? "").trim();
      const lastName = (data.contactLastName ?? "").trim();
      const hasContactPerson =
        firstName || lastName || data.email || data.phone;

      if (hasContactPerson) {
        const existingTenant =
          !id || id === "new"
            ? null
            : await tx.tenant.findUnique({ where: { id } });
        const existingPersonContactId = existingTenant?.primaryContactPersonId;

        if (existingPersonContactId) {
          // Update existing person contact
          const personContact = await tx.contact.update({
            where: { id: existingPersonContactId },
            data: {
              coreName: firstName || "Contact Person",
              kindName: lastName || "",
            },
          });
          primaryContactPersonId = personContact.id;

          // Update or create email for person contact
          if (data.email) {
            const existingEmail = await tx.email.findFirst({
              where: { contactId: existingPersonContactId, isPrimary: true },
            });
            if (existingEmail) {
              await tx.email.update({
                where: { id: existingEmail.id },
                data: { emailAddress: data.email.toLowerCase() },
              });
            } else {
              await tx.email.create({
                data: {
                  contactId: existingPersonContactId,
                  emailAddress: data.email.toLowerCase(),
                  isPrimary: true,
                },
              });
            }
          }

          // Update or create phone for person contact
          if (data.phone) {
            const existingPhone = await tx.phone.findFirst({
              where: { contactId: existingPersonContactId, isPrimary: true },
            });
            if (existingPhone) {
              await tx.phone.update({
                where: { id: existingPhone.id },
                data: { number: data.phone },
              });
            } else {
              await tx.phone.create({
                data: {
                  contactId: existingPersonContactId,
                  number: data.phone,
                  type: "MOBILE",
                  isPrimary: true,
                },
              });
            }
          }
        } else {
          // Create new person contact
          const personContact = await tx.contact.create({
            data: {
              coreName: firstName || "Contact Person",
              kindName: lastName || "",
              subject: "INDIVIDUAL",
              source: "USER",
            },
          });
          primaryContactPersonId = personContact.id;

          if (data.email) {
            await tx.email.create({
              data: {
                contactId: personContact.id,
                emailAddress: data.email.toLowerCase(),
                isPrimary: true,
              },
            });
          }

          if (data.phone) {
            await tx.phone.create({
              data: {
                contactId: personContact.id,
                number: data.phone,
                type: "MOBILE",
                isPrimary: true,
              },
            });
          }
        }
      }

      const nameCached = contactForCache
        ? {
            coreName: contactForCache.coreName,
            kindName: contactForCache.kindName,
            middleName: contactForCache.middleName,
            prefix: contactForCache.prefix,
            suffix: contactForCache.suffix,
            aliasName: contactForCache.aliasName,
            displayName: contactForCache.displayName,
          }
        : {
            coreName: trimmedCoreName,
            kindName: data.legalNameEnding,
            middleName: null,
            prefix: null,
            suffix: null,
            aliasName: data.operatingName ?? null,
            displayName: null,
          };

      const splitBusinessParts = data.businessNumber
        ? splitBusinessNumber(data.businessNumber)
        : null;

      const tenant = await tx.tenant.upsert({
        where: { id: id && id !== "new" ? id : "placeholder-id" },
        update: {
          nameCached: nameCached,
          slug: generatedSlug,
          contactId: contactId,
          primaryContactPersonId: primaryContactPersonId,
          businessBn9: splitBusinessParts?.bn9 ?? null,
          businessProgramId: splitBusinessParts?.programId ?? null,
          programRefNum: splitBusinessParts?.accountRef ?? null,
          isActive: data.isActive,
        },
        create: {
          nameCached: nameCached,
          slug: generatedSlug,
          contactId: contactId,
          primaryContactPersonId: primaryContactPersonId,
          businessBn9: splitBusinessParts?.bn9 ?? null,
          businessProgramId: splitBusinessParts?.programId ?? null,
          programRefNum: splitBusinessParts?.accountRef ?? null,
          isActive: data.isActive,
          settings: {
            create: {
              timezone: "America/Toronto",
            },
          },
        },
        include: {
          settings: true,
          members: true,
        },
      });

      if (!id || id === "new") {
        await tx.earningCode.createMany({
          data: DEFAULT_EARNING_CODES.map((definition) => ({
            tenantId: tenant.id,
            ...definition,
          })),
          skipDuplicates: true,
        });
      }

      if (data.payFrequency) {
        const [existingPayrollUnit, existingPaySchedule] = await Promise.all([
          tx.payrollUnit.findFirst({
            where: {
              tenantId: tenant.id,
              isActive: true,
            },
            orderBy: { createdAt: "asc" },
          }),
          tx.paySchedule.findFirst({
            where: {
              tenantId: tenant.id,
              isActive: true,
            },
            orderBy: { updatedAt: "desc" },
          }),
        ]);

        const payrollUnitNames = await tx.payrollUnit.findMany({
          where: {
            tenantId: tenant.id,
            ...(existingPayrollUnit
              ? { id: { not: existingPayrollUnit.id } }
              : {}),
          },
          select: { name: true },
        });

        const payScheduleCode =
          existingPaySchedule?.code ?? normalizedPayScheduleCode ?? "MAIN";
        const payrollUnitCode = existingPayrollUnit?.code ?? "MAIN";
        const payrollUnitBaseName =
          data.payrollUnitName?.trim() ||
          formatPayFrequencyName(data.payFrequency) ||
          "Main Payroll";
        const payrollUnitName = buildUniquePayrollUnitName(
          payrollUnitBaseName,
          payrollUnitNames.map((payrollUnit) => payrollUnit.name),
        );
        const timingDays =
          data.timingDays ?? existingPaySchedule?.timingDays ?? 2;

        const paySchedulePayload = {
          frequency: data.payFrequency,
          timingDays,
          payday: data.payday ?? null,
          payWeekday: data.payWeekday ?? null,
          boundaryShift: data.boundaryShift ?? 0,
          periodEndDay: data.periodEndDay ?? -1,
          periodEndWeekday: data.periodEndWeekday ?? null,
          payday2: data.payday2 ?? null,
          periodEndDay2: data.periodEndDay2 ?? null,
          boundaryShift2: data.boundaryShift2 ?? null,
        };

        const payrollUnitId = existingPayrollUnit
          ? existingPayrollUnit.id
          : (
              await tx.payrollUnit.create({
                data: {
                  tenantId: tenant.id,
                  code: payrollUnitCode,
                  name: payrollUnitName,
                  isActive: true,
                },
              })
            ).id;

        if (existingPayrollUnit) {
          await tx.payrollUnit.update({
            where: { id: existingPayrollUnit.id },
            data: {
              name: payrollUnitName,
            },
          });
        }

        const payScheduleData = {
          ...paySchedulePayload,
          tenantId: tenant.id,
          payrollUnitId,
          code: payScheduleCode,
          name: payScheduleCode,
          isActive: true,
        };

        if (existingPaySchedule) {
          await tx.paySchedule.update({
            where: { id: existingPaySchedule.id },
            data: payScheduleData,
          });
        } else {
          await tx.paySchedule.create({
            data: payScheduleData,
          });
        }
      }

      if (!id || id === "new") {
        await tx.tenantUser.upsert({
          where: {
            tenantId_userId: { tenantId: tenant.id, userId: session.userId },
          },
          update: { role: "OWNER" },
          create: {
            tenantId: tenant.id,
            userId: session.userId,
            role: "OWNER",
          },
        });
      }

      if (memberEmailList.length > 0) {
        const users = await tx.user.findMany({
          where: { slug: { in: memberEmailList } },
          select: { id: true },
        });

        const memberRows = users
          .filter((user) => user.id !== session.userId)
          .map((user) => ({
            tenantId: tenant.id,
            userId: user.id,
            role: "EMPLOYEE" as const,
          }));

        if (memberRows.length > 0) {
          await tx.tenantUser.createMany({
            data: memberRows,
            skipDuplicates: true,
          });
        }
      }

      return tenant;
    }),
  );
}

async function requireOwnedTenant(tenantId: string, userId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      members: {
        some: {
          userId,
          role: "OWNER",
        },
      },
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!tenant) {
    throw new Error("Employer not found or access denied.");
  }

  return tenant;
}

export async function setTenantActiveState(
  tenantId: string,
  isActive: boolean,
) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  return await safe(
    (async () => {
      await requireOwnedTenant(tenantId, session.userId);

      return prisma.tenant.update({
        where: { id: tenantId },
        data: { isActive },
        select: {
          id: true,
          isActive: true,
        },
      });
    })(),
  );
}

export async function deleteTenant(tenantId: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" } as const;
  }

  return await safe(
    (async () => {
      await requireOwnedTenant(tenantId, session.userId);

      try {
        return await prisma.$transaction(async (tx) => {
          // Check if there are any payroll runs or employees
          const payrollRunCount = await tx.payrollRun.count({
            where: { tenantId },
          });

          if (payrollRunCount > 0) {
            throw new Error(
              "This employer can't be deleted because it has payroll records. Set it inactive instead.",
            );
          }

          const employeeCount = await tx.employee.count({
            where: { tenantId },
          });

          if (employeeCount > 0) {
            throw new Error(
              "This employer can't be deleted because it has employees. Set it inactive instead.",
            );
          }

          const earningCodeCount = await tx.earningCode.count({
            where: { tenantId },
          });

          if (earningCodeCount > 2) {
            throw new Error(
              "This employer can't be deleted because it has earning codes. Delete those earning codes first or set the employer inactive instead.",
            );
          }

          // Delete all tenant-related records in correct dependency order
          await tx.billingInvoice.deleteMany({
            where: { tenantId },
          });
          await tx.paymentTransaction.deleteMany({
            where: { tenantId },
          });
          await tx.billingCustomer.deleteMany({
            where: { tenantId },
          });
          await tx.paySlip.deleteMany({
            where: { tenantId },
          });
          await tx.remittance.deleteMany({
            where: { tenantId },
          });
          await tx.tenantSettings.deleteMany({
            where: { tenantId },
          });
          await tx.tenantUser.deleteMany({
            where: { tenantId },
          });
          await tx.tenantSubscription.deleteMany({
            where: { tenantId },
          });
          await tx.department.deleteMany({
            where: { tenantId },
          });
          await tx.overtimeConfig.deleteMany({
            where: { tenantId },
          });
          await tx.holidayPolicy.deleteMany({
            where: { tenantId },
          });
          await tx.paySchedule.deleteMany({
            where: { tenantId },
          });
          await tx.payrollUnit.deleteMany({
            where: { tenantId },
          });

          await tx.earningCode.deleteMany({
            where: { tenantId },
          });

          return tx.tenant.delete({
            where: { id: tenantId },
            select: { id: true },
          });
        });
      } catch (error) {
        console.error("Delete tenant error:", error);

        if (
          error instanceof Error &&
          error.message.includes("This employer can't be deleted")
        ) {
          throw error;
        }

        throw new Error(
          "This employer can't be deleted because it has related records. Set it inactive instead.",
        );
      }
    })(),
  );
}
