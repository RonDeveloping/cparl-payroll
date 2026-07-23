"use server";
// db/internal/employeeHelper.ts

import { DEFAULT_EARNING_CODES } from "@/constants/earning-types";
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

function parseMoney(value: string | null | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return null;

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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
  const payrollUnitId = data.payrollUnitId?.trim() || null;
  const employmentTitle = data.employmentTitle?.trim() || null;
  const employmentDepartment = data.employmentDepartment?.trim() || null;
  const jobEarningCodeId = data.jobEarningCodeId?.trim() || null;
  const jobPayRate = data.jobPayRate?.trim() || null;
  const jobHoursPerWeek = data.jobHoursPerWeek?.trim() || null;
  const additionalEarnings = (data.additionalEarnings || [])
    .map((earning) => ({
      jobEarningCodeId: earning.jobEarningCodeId?.trim() || null,
      jobPayRate: earning.jobPayRate?.trim() || null,
      jobHoursPerWeek: earning.jobHoursPerWeek?.trim() || null,
    }))
    .filter((earning) => earning.jobEarningCodeId && earning.jobPayRate);
  const contributorySelections = (data.contributorySelections || [])
    .map((selection) => ({
      contributoryCodeId: selection.contributoryCodeId?.trim() || null,
      deductionAmount: parseMoney(selection.deductionAmount),
      participationAmount: parseMoney(selection.participationAmount),
    }))
    .filter((selection) => selection.contributoryCodeId);
  const parsedJobStartDate = parseIsoDate(data.jobStartDate ?? "");
  const parsedJobEndDate = parseIsoDate(data.jobEndDate ?? "");
  const effectiveJobEndDate = parsedJobEndDate ?? parsedEmploymentEndDate;
  const hasJobAssignmentData = Boolean(jobEarningCodeId && jobPayRate);
  let effectiveJobEarningCodeId = jobEarningCodeId;

  if (payrollUnitId) {
    const selectedPayrollUnit = await tx.payrollUnit.findFirst({
      where: {
        id: payrollUnitId,
        tenantId,
      },
      select: { id: true },
    });

    if (!selectedPayrollUnit) {
      throw new Error("Selected payroll unit is invalid for this tenant");
    }
  }

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
      phoneCached: {
        primaryPhone: data.phone?.trim() || null,
        emergencyContactName: data.emergencyContactName?.trim() || null,
        emergencyContactGivenName:
          data.emergencyContactGivenName?.trim() || null,
        emergencyContactFamilyName:
          data.emergencyContactFamilyName?.trim() || null,
        emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
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
      phoneCached: {
        primaryPhone: data.phone?.trim() || null,
        emergencyContactName: data.emergencyContactName?.trim() || null,
        emergencyContactGivenName:
          data.emergencyContactGivenName?.trim() || null,
        emergencyContactFamilyName:
          data.emergencyContactFamilyName?.trim() || null,
        emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
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

  await tx.earningCode.createMany({
    data: DEFAULT_EARNING_CODES.map((definition) => ({
      tenantId,
      ...definition,
    })),
    skipDuplicates: true,
  });

  const defaultSalaryEarningCode = await tx.earningCode.findFirst({
    where: {
      tenantId,
      code: "SAL",
    },
    select: { id: true },
  });

  if (!defaultSalaryEarningCode) {
    throw new Error("Failed to ensure default SAL earning code");
  }

  if (effectiveJobEarningCodeId) {
    const selectedEarningCode = await tx.earningCode.findFirst({
      where: {
        id: effectiveJobEarningCodeId,
        tenantId,
      },
      select: { id: true },
    });

    if (!selectedEarningCode) {
      effectiveJobEarningCodeId = defaultSalaryEarningCode.id;
    }
  }

  const submittedAssignments: {
    earningCodeId: string;
    payRate: string;
    hoursPerWeek: string | null;
    startDate: Date;
    endDate: Date | null;
  }[] = [];

  if (hasJobAssignmentData && jobPayRate) {
    submittedAssignments.push({
      earningCodeId: effectiveJobEarningCodeId!,
      payRate: jobPayRate,
      hoursPerWeek: jobHoursPerWeek,
      startDate: parsedJobStartDate ?? parsedHireDate ?? employment.startDate,
      endDate: effectiveJobEndDate ?? null,
    });
  }

  for (const additionalEarning of additionalEarnings) {
    const selectedEarningCode = await tx.earningCode.findFirst({
      where: {
        id: additionalEarning.jobEarningCodeId!,
        tenantId,
      },
      select: { id: true },
    });

    submittedAssignments.push({
      earningCodeId: selectedEarningCode?.id || defaultSalaryEarningCode.id,
      payRate: additionalEarning.jobPayRate!,
      hoursPerWeek: additionalEarning.jobHoursPerWeek,
      startDate: parsedJobStartDate ?? parsedHireDate ?? employment.startDate,
      endDate: effectiveJobEndDate ?? null,
    });
  }

  await tx.jobAssignment.deleteMany({
    where: { employmentId: employment.id },
  });

  if (submittedAssignments.length > 0) {
    await tx.jobAssignment.createMany({
      data: submittedAssignments.map((assignment) => ({
        employmentId: employment.id,
        startDate: assignment.startDate,
        earningCodeId: assignment.earningCodeId,
        payRate: assignment.payRate,
        hoursPerWeek: assignment.hoursPerWeek,
        endDate: assignment.endDate,
      })),
    });
  }

  if (payrollUnitId) {
    const effectiveAssignmentStartDate = parsedHireDate ?? now;

    await tx.payrollUnitEmployee.updateMany({
      where: {
        tenantId,
        employeeId: employee.id,
        endDate: null,
        payrollUnitId: { not: payrollUnitId },
      },
      data: {
        endDate: effectiveAssignmentStartDate,
        isPrimary: false,
      },
    });

    const matchingActiveAssignment = await tx.payrollUnitEmployee.findFirst({
      where: {
        tenantId,
        employeeId: employee.id,
        payrollUnitId,
        endDate: null,
      },
      select: { id: true },
      orderBy: { startDate: "desc" },
    });

    if (!matchingActiveAssignment) {
      await tx.payrollUnitEmployee.create({
        data: {
          tenantId,
          employeeId: employee.id,
          payrollUnitId,
          startDate: effectiveAssignmentStartDate,
          endDate: null,
          isPrimary: true,
        },
      });
    } else {
      await tx.payrollUnitEmployee.update({
        where: { id: matchingActiveAssignment.id },
        data: { isPrimary: true },
      });
    }
  }

  await tx.employeeContributorySelection.deleteMany({
    where: {
      tenantId,
      employeeId: employee.id,
    },
  });

  if (contributorySelections.length > 0) {
    const contributoryCodeIds = contributorySelections
      .map((selection) => selection.contributoryCodeId)
      .filter((id): id is string => Boolean(id));

    const validCodes = await tx.contributoryCode.findMany({
      where: {
        tenantId,
        id: { in: contributoryCodeIds },
      },
      select: { id: true },
    });
    const validIdSet = new Set(validCodes.map((code) => code.id));

    const deduplicated = new Map<
      string,
      { deductionAmount: number; participationAmount: number }
    >();

    for (const selection of contributorySelections) {
      const contributoryCodeId = selection.contributoryCodeId;
      if (!contributoryCodeId || !validIdSet.has(contributoryCodeId)) continue;

      deduplicated.set(contributoryCodeId, {
        deductionAmount: selection.deductionAmount ?? 0,
        participationAmount: selection.participationAmount ?? 0,
      });
    }

    if (deduplicated.size > 0) {
      await tx.employeeContributorySelection.createMany({
        data: Array.from(deduplicated.entries()).map(
          ([contributoryCodeId, values]) => ({
            tenantId,
            employeeId: employee.id,
            contributoryCodeId,
            deductionAmount: values.deductionAmount,
            participationAmount: values.participationAmount,
          }),
        ),
      });
    }
  }

  return employee;
}
