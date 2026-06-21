"use server";
// db/internal/employeeHelper.ts

import { ContactFormInput } from "@/lib/validations/contact-schema";
import { PrismaClient } from "@prisma/client";

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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

export async function upsertEmployeePEAInternal(
  data: ContactFormInput,
  contactId: string,
  tenantId: string,
  tx: PrismaTransaction,
) {
  const now = new Date();
  const parsedHireDate = parseIsoDate(data.hireDate ?? "");
  const parsedEmploymentEndDate = parseIsoDate(data.employmentEndDate ?? "");
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
  const jobHoursPerWeek = data.jobHoursPerWeek?.trim() || null;
  const parsedJobStartDate = parseIsoDate(data.jobStartDate ?? "");
  const parsedJobEndDate = parseIsoDate(data.jobEndDate ?? "");
  const effectiveJobEndDate = parsedJobEndDate ?? parsedEmploymentEndDate;
  const hasJobAssignmentData = Boolean(data.jobPayType && jobPayRate);

  const employee = await tx.employee.upsert({
    where: {
      tenantId_contactId: {
        tenantId,
        contactId,
      },
    },
    update: {
      employeeNumber: data.employeeNumber?.trim() || null,
      nameCached: {
        coreName: data.givenName,
        kindName: data.familyName,
        middleName: data.middleName ?? null,
        prefix: data.prefix ?? null,
        suffix: data.suffix ?? null,
        aliasName: data.nickName ?? null,
        displayName: data.displayName ?? null,
      },
      addressCached: {
        street: data.street ?? "",
        city: data.city ?? "",
        province: data.province ?? "",
        postalCode: data.postalCode ?? "",
        country: data.country ?? "",
      },
      emailCached: data.email.trim() || null,
      ...(parsedHireDate ? { hireDate: parsedHireDate } : {}),
      ...(data.status
        ? { status: data.status }
        : { status: "ACTIVE" as const }),
    },
    create: {
      tenantId,
      contactId,
      employeeNumber: data.employeeNumber?.trim() || null,
      taxIdEncrypted: Buffer.from((data.sin ?? "").replace(/\D/g, ""), "utf-8"),
      taxIdLast4: (data.sin ?? "").replace(/\D/g, "").slice(-4) || "0000",
      dateOfBirth: parsedHireDate ?? now,
      hireDate: parsedHireDate ?? now,
      status: data.status || "ACTIVE",
      nameCached: {
        coreName: data.givenName,
        kindName: data.familyName,
        middleName: data.middleName ?? null,
        prefix: data.prefix ?? null,
        suffix: data.suffix ?? null,
        aliasName: data.nickName ?? null,
        displayName: data.displayName ?? null,
      },
      addressCached: {
        street: data.street ?? "",
        city: data.city ?? "",
        province: data.province ?? "",
        postalCode: data.postalCode ?? "",
        country: data.country ?? "",
      },
      emailCached: data.email.trim() || null,
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
          terminationReason: data.terminationReason,
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
          terminationReason: data.terminationReason,
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
          hoursPerWeek: jobHoursPerWeek,
          endDate: effectiveJobEndDate ?? null,
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
          hoursPerWeek: jobHoursPerWeek,
          endDate: effectiveJobEndDate ?? null,
        },
      });
    }
  }

  return employee;
}
