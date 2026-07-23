// app/employees/[id]/edit/page.tsx
import prisma from "@/db/prismaDrizzle";
import EditEmployeeForm from "./edit-employee";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import { getEarningCodeDescription } from "@/lib/earning-code-display";
import formatPhone from "@/utils/formatters/phone";
import formatPostalCode from "@/utils/formatters/postalCode";
import {
  createEmptyTimeOffBenchmarkDraft,
  type TimeOffBenchmarkDraft,
} from "@/constants/time-off-policies";

function titleCase(value: string | null | undefined): string {
  if (!value) return "Not set";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toOrdinal(day: number): string {
  const abs = Math.abs(day);
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;

  const mod10 = abs % 10;
  if (mod10 === 1) return `${day}st`;
  if (mod10 === 2) return `${day}nd`;
  if (mod10 === 3) return `${day}rd`;
  return `${day}th`;
}

function formatMonthRelation(shift: number | null | undefined): string {
  if (shift === -1) return "previous month";
  if (shift === 1) return "next month";
  return "a month";
}

function formatPayrollDaySummary(
  day: number | null | undefined,
  monthShift: number | null | undefined,
): string {
  if (day == null) return "Not set";
  if (day === -1) return `Last day of ${formatMonthRelation(monthShift)}`;
  if (day === -2) {
    return `2nd-to-last day of ${formatMonthRelation(monthShift)}`;
  }
  if (day === -3) {
    return `3rd-to-last day of ${formatMonthRelation(monthShift)}`;
  }
  if (day <= 0) return "Not set";
  if (day >= 31) return `Last day of ${formatMonthRelation(monthShift)}`;
  return `${toOrdinal(day)} day of ${formatMonthRelation(monthShift)}`;
}

function summarizePayday(
  frequency: string | null | undefined,
  payWeekday: string | null | undefined,
  payday: number | null | undefined,
  payday2: number | null | undefined,
  periodEndDay: number | null | undefined,
  boundaryShift: number | null | undefined,
  timingDays: number | null | undefined,
): string {
  const normalizedFrequency = (frequency || "").toUpperCase();

  if (normalizedFrequency === "WEEKLY" || normalizedFrequency === "BIWEEKLY") {
    return titleCase(payWeekday);
  }

  if (normalizedFrequency === "SEMIMONTHLY") {
    return `${formatPayrollDaySummary(payday, 0)} & ${formatPayrollDaySummary(
      payday2,
      0,
    )}`;
  }

  if (normalizedFrequency === "MONTHLY" && payday == null) {
    const endDay = periodEndDay ?? null;
    const shift = boundaryShift ?? 0;
    const lag = timingDays ?? null;

    if (endDay != null && lag != null) {
      const toComparableDay = (day: number) => (day < 0 ? 32 + day : day);
      const toStoredDay = (day: number) => {
        if (day === 31) return -1;
        if (day === 30) return -2;
        if (day === 29) return -3;
        return day;
      };

      const normalizeComparable = (day: number) => {
        let normalized = day;
        while (normalized < 1) normalized += 31;
        while (normalized > 31) normalized -= 31;
        return normalized;
      };

      const comparablePayday = normalizeComparable(
        toComparableDay(endDay) + shift * 31 - lag,
      );
      return formatPayrollDaySummary(toStoredDay(comparablePayday), 0);
    }
  }

  return formatPayrollDaySummary(payday, 0);
}

function summarizePeriodEnd(
  frequency: string | null | undefined,
  periodEndWeekday: string | null | undefined,
  periodEndDay: number | null | undefined,
  periodEndDay2: number | null | undefined,
  boundaryShift: number | null | undefined,
  boundaryShift2: number | null | undefined,
): string {
  const normalizedFrequency = (frequency || "").toUpperCase();

  if (normalizedFrequency === "WEEKLY" || normalizedFrequency === "BIWEEKLY") {
    return titleCase(periodEndWeekday);
  }

  if (normalizedFrequency === "SEMIMONTHLY") {
    return `${formatPayrollDaySummary(
      periodEndDay,
      boundaryShift,
    )} & ${formatPayrollDaySummary(periodEndDay2, boundaryShift2)}`;
  }

  return formatPayrollDaySummary(periodEndDay, boundaryShift);
}

function getPayPeriodsPerYear(frequency: string | null | undefined): number {
  const normalizedFrequency = (frequency || "").toUpperCase();

  if (normalizedFrequency === "WEEKLY") return 52;
  if (normalizedFrequency === "BIWEEKLY") return 26;
  if (normalizedFrequency === "SEMIMONTHLY") return 24;
  if (normalizedFrequency === "MONTHLY") return 12;

  return 1;
}

function formatPerPayAmount(
  amount: { toString(): string } | number | null | undefined,
  payPeriodsPerYear: number,
): string {
  if (amount == null) return "";

  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number.parseFloat(amount.toString().replace(/,/g, "").trim());

  if (!Number.isFinite(numericAmount)) return "";

  const divisor = payPeriodsPerYear > 0 ? payPeriodsPerYear : 1;
  const perPay = numericAmount / divisor;

  return perPay.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getEmployerDisplayName(nameCached: unknown): string {
  const fallback = "Employer";
  if (!nameCached || typeof nameCached !== "object") return fallback;

  const record = nameCached as {
    coreName?: unknown;
    kindName?: unknown;
    aliasName?: unknown;
    displayName?: unknown;
  };

  const displayName =
    typeof record.displayName === "string" ? record.displayName.trim() : "";
  const aliasName =
    typeof record.aliasName === "string" ? record.aliasName.trim() : "";
  const coreName =
    typeof record.coreName === "string" ? record.coreName.trim() : "";
  const kindName =
    typeof record.kindName === "string" ? record.kindName.trim() : "";
  const legalName = [coreName, kindName].filter(Boolean).join(" ").trim();

  if (legalName) return legalName;
  if (displayName) return displayName;
  if (aliasName) return aliasName;

  return fallback;
}

function getEmployeeEmergencyContact(phoneCached: unknown) {
  if (!phoneCached || typeof phoneCached !== "object") {
    return {
      emergencyContactName: "",
      emergencyContactGivenName: "",
      emergencyContactFamilyName: "",
      emergencyContactPhone: "",
    };
  }

  const record = phoneCached as {
    emergencyContactName?: unknown;
    emergencyContactGivenName?: unknown;
    emergencyContactFamilyName?: unknown;
    emergencyContactPhone?: unknown;
  };

  return {
    emergencyContactName:
      typeof record.emergencyContactName === "string"
        ? record.emergencyContactName
        : "",
    emergencyContactGivenName:
      typeof record.emergencyContactGivenName === "string"
        ? record.emergencyContactGivenName
        : "",
    emergencyContactFamilyName:
      typeof record.emergencyContactFamilyName === "string"
        ? record.emergencyContactFamilyName
        : "",
    emergencyContactPhone:
      typeof record.emergencyContactPhone === "string"
        ? formatPhone(record.emergencyContactPhone)
        : "",
  };
}

async function getTenantTimeOffBenchmarkDraft(
  tenantId: string | undefined,
): Promise<TimeOffBenchmarkDraft> {
  const draft = createEmptyTimeOffBenchmarkDraft();
  if (!tenantId) return draft;

  const rows = await prisma.tenantTimeOffBenchmarkPolicy.findMany({
    where: { tenantId },
    select: {
      policyType: true,
      accrualFrequency: true,
      accrualRatePercent: true,
      annualAllowanceHours: true,
      hourCapHours: true,
    },
  });

  for (const row of rows) {
    if (row.policyType === "VACATION") {
      draft.frequency.vacationTimeOff = row.accrualFrequency || "";
      draft.accrualRate.vacationTimeOff =
        row.accrualRatePercent?.toString() || "";
      draft.annualAllowance.vacationTimeOff =
        row.annualAllowanceHours?.toString() || "";
      draft.hourCap.vacationTimeOff = row.hourCapHours?.toString() || "";
      continue;
    }

    if (row.policyType === "SICK") {
      draft.frequency.sickTimeOff = row.accrualFrequency || "";
      draft.accrualRate.sickTimeOff = row.accrualRatePercent?.toString() || "";
      draft.annualAllowance.sickTimeOff =
        row.annualAllowanceHours?.toString() || "";
      draft.hourCap.sickTimeOff = row.hourCapHours?.toString() || "";
      continue;
    }

    if (row.policyType === "UNPAID") {
      draft.frequency.personalTimeOff = row.accrualFrequency || "";
      draft.accrualRate.personalTimeOff =
        row.accrualRatePercent?.toString() || "";
      draft.annualAllowance.personalTimeOff =
        row.annualAllowanceHours?.toString() || "";
      draft.hourCap.personalTimeOff = row.hourCapHours?.toString() || "";
    }
  }

  return draft;
}

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await searchParams;
  const timeOffBenchmarkDraft = await getTenantTimeOffBenchmarkDraft(tenantId);
  const fallbackPaySchedule = tenantId
    ? await prisma.paySchedule.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: {
          frequency: true,
          timingDays: true,
          payWeekday: true,
          payday: true,
          payday2: true,
          boundaryShift: true,
          periodEndWeekday: true,
          periodEndDay: true,
          periodEndDay2: true,
          boundaryShift2: true,
        },
      })
    : null;
  const earningCodeOptions = tenantId
    ? (
        await prisma.earningCode.findMany({
          where: { tenantId, isActive: true },
          select: {
            id: true,
            code: true,
            description: true,
            isHourly: true,
          },
          orderBy: [{ code: "asc" }],
        })
      ).map((earningCode) => ({
        ...earningCode,
        description: getEarningCodeDescription(earningCode),
      }))
    : [];
  const payrollUnitOptions = tenantId
    ? (
        await prisma.payrollUnit.findMany({
          where: { tenantId, isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            paySchedules: {
              where: { isActive: true },
              orderBy: { updatedAt: "desc" },
              take: 1,
              select: {
                frequency: true,
                timingDays: true,
                payWeekday: true,
                payday: true,
                payday2: true,
                boundaryShift: true,
                periodEndWeekday: true,
                periodEndDay: true,
                periodEndDay2: true,
                boundaryShift2: true,
              },
            },
          },
          orderBy: [{ code: "asc" }],
        })
      ).map((unit) => {
        const schedule = unit.paySchedules[0] ?? fallbackPaySchedule;
        return {
          id: unit.id,
          code: unit.code,
          name: unit.name,
          frequency: schedule?.frequency ?? null,
          paydaySummary: summarizePayday(
            schedule?.frequency,
            schedule?.payWeekday,
            schedule?.payday,
            schedule?.payday2,
            schedule?.periodEndDay,
            schedule?.boundaryShift,
            schedule?.timingDays,
          ),
          periodEndSummary: summarizePeriodEnd(
            schedule?.frequency,
            schedule?.periodEndWeekday,
            schedule?.periodEndDay,
            schedule?.periodEndDay2,
            schedule?.boundaryShift,
            schedule?.boundaryShift2,
          ),
        };
      })
    : [];
  const contributoryCodeOptions = tenantId
    ? await prisma.contributoryCode.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          code: true,
          description: true,
          employeeDeductionRate: true,
          employeeExemptEarnings: true,
          employeeDeductionLimit: true,
          employerParticipationRate: true,
        },
        orderBy: [{ code: "asc" }],
      })
    : [];
  const defaultRegularEarningCode =
    earningCodeOptions.find((earningCode) => earningCode.code === "REG") ??
    null;
  const employerName = tenantId
    ? await prisma.tenant
        .findUnique({
          where: { id: tenantId },
          select: { nameCached: true },
        })
        .then((tenant) =>
          tenant ? getEmployerDisplayName(tenant.nameCached) : undefined,
        )
    : undefined;
  const todayIso = new Date().toISOString().slice(0, 10);

  const blankBankAccount = {
    id: "",
    institutionNumber: "",
    bankDetails: "",
    distributionType: undefined,
    distributionValue: "",
  };

  const ensureMinimumBankRows = (
    bankAccounts: Array<{
      id: string;
      institutionNumber: string;
      bankDetails: string;
      distributionType?: "FIXED_AMOUNT" | "PERCENTAGE" | "REMAINDER";
      distributionValue: string;
    }>,
    minimumRows = 1,
  ) => [
    ...bankAccounts,
    ...Array.from(
      { length: Math.max(0, minimumRows - bankAccounts.length) },
      () => ({
        ...blankBankAccount,
      }),
    ),
  ];

  if (id === "new") {
    const emptyData: ContactFormInput = {
      givenName: "",
      familyName: "",
      middleName: "",
      nickName: "",
      displayName: "",
      prefix: "",
      suffix: "",
      sin: "",
      dob: "",
      employeeNumber: "",
      employmentTitle: "",
      employmentDepartment: "",
      payrollUnitId: payrollUnitOptions[0]?.id,
      hireDate: todayIso,
      employmentEndDate: "",
      employmentProvinceCode: "ON",
      terminationReason: undefined,
      jobEarningCodeId: defaultRegularEarningCode?.id,
      jobStartDate: "",
      jobPayRate: "",
      jobHoursPerWeek: "",
      jobEndDate: "",
      federalClaim: "",
      provincialClaim: "",
      additionalTax: "",
      dentalDeduction: "",
      medicalDeduction: "",
      otherVoluntaryDeduction: "",
      wsibDeduction: "",
      vacationTimeOff: "",
      sickTimeOff: "",
      personalTimeOff: "",
      exemptions: "",
      additionalEarnings: [],
      contributorySelections: [
        {
          contributoryCodeId: "",
          deductionAmount: "",
          participationAmount: "",
        },
      ],
      status: "ACTIVE",
      email: "",
      phone: "",
      emergencyContactName: "",
      emergencyContactGivenName: "",
      emergencyContactFamilyName: "",
      emergencyContactPhone: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Canada",
      bankAccounts: ensureMinimumBankRows([
        {
          ...blankBankAccount,
          distributionType: "PERCENTAGE",
          distributionValue: "100",
        },
      ]),
    };
    emptyData.vacationTimeOff =
      timeOffBenchmarkDraft.accrualRate.vacationTimeOff;
    emptyData.sickTimeOff = timeOffBenchmarkDraft.accrualRate.sickTimeOff;
    emptyData.personalTimeOff =
      timeOffBenchmarkDraft.accrualRate.personalTimeOff;

    return (
      <EditEmployeeForm
        paramsPromise={params}
        initialData={emptyData}
        bankAccountStatuses={["UNVERIFIED"]}
        earningCodeOptions={earningCodeOptions}
        payrollUnitOptions={payrollUnitOptions}
        contributoryCodeOptions={contributoryCodeOptions.map((option) => ({
          id: option.id,
          code: option.code,
          description: option.description,
          employeeExcludedEarnings: option.employeeExemptEarnings.toString(),
          employeeCapAmount: option.employeeDeductionLimit?.toString() ?? null,
          defaultDeductionAmount: option.employeeDeductionRate.toString(),
          defaultParticipationAmount:
            option.employerParticipationRate?.toString() ?? "",
        }))}
        timeOffBenchmarkDraft={timeOffBenchmarkDraft}
        tenantId={tenantId}
        employerName={employerName}
      />
    );
  }

  const employee = tenantId
    ? await prisma.employee.findFirst({
        where: { contactId: id, tenantId },
        select: {
          id: true,
          employeeNumber: true,
          dateOfBirth: true,
          hireDate: true,
          phoneCached: true,
          status: true,
        },
      })
    : await prisma.employee.findFirst({
        where: { contactId: id },
        select: {
          id: true,
          employeeNumber: true,
          dateOfBirth: true,
          hireDate: true,
          phoneCached: true,
          status: true,
        },
      });

  const employment = employee?.id
    ? await prisma.employment.findFirst({
        where: tenantId
          ? { employeeId: employee.id, tenantId }
          : { employeeId: employee.id },
        select: {
          id: true,
          title: true,
          department: true,
          provinceCode: true,
          endDate: true,
          terminationReason: true,
          startDate: true,
        },
        orderBy: { startDate: "desc" },
      })
    : null;
  const payrollUnitAssignment = employee?.id
    ? await prisma.payrollUnitEmployee.findFirst({
        where: tenantId
          ? { employeeId: employee.id, tenantId, endDate: null }
          : { employeeId: employee.id, endDate: null },
        select: {
          payrollUnitId: true,
          startDate: true,
        },
        orderBy: { startDate: "desc" },
      })
    : null;

  const jobAssignments = employment?.id
    ? await prisma.jobAssignment.findMany({
        where: { employmentId: employment.id },
        select: {
          id: true,
          startDate: true,
          earningCodeId: true,
          payRate: true,
          hoursPerWeek: true,
          endDate: true,
        },
        orderBy: { startDate: "desc" },
      })
    : [];
  const primaryJobAssignment = jobAssignments[0] || null;
  const primaryJobAssignmentHoursPerWeek = (
    primaryJobAssignment as {
      hoursPerWeek?: { toString(): string } | null;
    } | null
  )?.hoursPerWeek;
  const additionalJobAssignments = jobAssignments.slice(1);

  const bankAccounts = employee?.id
    ? await prisma.bankAccount.findMany({
        where: { employeeId: employee.id, isActive: true },
        select: {
          id: true,
          institutionNumber: true,
          branchNumber: true,
          accountNumber: true,
          label: true,
          type: true,
          value: true,
          priority: true,
          verificationStatus: true,
        },
        orderBy: [{ isPrimary: "desc" }, { priority: "asc" }],
      })
    : [];
  const employeeContributorySelections = employee?.id
    ? await prisma.employeeContributorySelection.findMany({
        where: tenantId
          ? { employeeId: employee.id, tenantId }
          : { employeeId: employee.id },
        select: {
          contributoryCodeId: true,
          deductionAmount: true,
          participationAmount: true,
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const selectedPayrollUnitForContributoryDisplay =
    payrollUnitAssignment?.payrollUnitId || payrollUnitOptions[0]?.id || null;
  const selectedPayrollUnitFrequencyForContributoryDisplay =
    payrollUnitOptions.find(
      (option) => option.id === selectedPayrollUnitForContributoryDisplay,
    )?.frequency ?? null;
  const contributoryPayPeriodsPerYear = getPayPeriodsPerYear(
    selectedPayrollUnitFrequencyForContributoryDisplay,
  );

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      emails: { where: { isPrimary: true }, take: 1 },
      addresses: { where: { isPrimary: true }, take: 1 },
      phones: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!contact) {
    return (
      <div className="p-8">
        <p className="text-red-600">Employee not found</p>
      </div>
    );
  }

  const initialData: ContactFormInput = {
    ...getEmployeeEmergencyContact(employee?.phoneCached),
    givenName: contact.coreName,
    familyName: contact.kindName,
    middleName: "",
    nickName: contact.aliasName || "",
    prefix: "",
    suffix: "",
    displayName: contact.displayName || "",
    sin: "",
    dob: employee?.dateOfBirth
      ? employee.dateOfBirth.toISOString().slice(0, 10)
      : "",
    employeeNumber: employee?.employeeNumber || "",
    employmentTitle: employment?.title || "",
    employmentDepartment: employment?.department || "",
    payrollUnitId: payrollUnitAssignment?.payrollUnitId || undefined,
    hireDate: employee?.hireDate
      ? employee.hireDate.toISOString().slice(0, 10)
      : "",
    employmentEndDate: employment?.endDate
      ? employment.endDate.toISOString().slice(0, 10)
      : "",
    employmentProvinceCode: employment?.provinceCode || "ON",
    terminationReason: employment?.terminationReason || undefined,
    jobEarningCodeId: primaryJobAssignment?.earningCodeId || undefined,
    jobStartDate: primaryJobAssignment?.startDate
      ? primaryJobAssignment.startDate.toISOString().slice(0, 10)
      : "",
    jobPayRate: primaryJobAssignment?.payRate?.toString() || "",
    jobHoursPerWeek: primaryJobAssignmentHoursPerWeek?.toString() || "",
    jobEndDate: primaryJobAssignment?.endDate
      ? primaryJobAssignment.endDate.toISOString().slice(0, 10)
      : "",
    federalClaim: "",
    provincialClaim: "",
    additionalTax: "",
    dentalDeduction: "",
    medicalDeduction: "",
    otherVoluntaryDeduction: "",
    wsibDeduction: "",
    dentalContribution: "",
    medicalContribution: "",
    otherVoluntaryContribution: "",
    wsibContribution: "",
    dentalTax: false,
    dentalEi: false,
    medicalTax: false,
    medicalEi: false,
    otherVoluntaryTax: false,
    otherVoluntaryEi: false,
    wsibTax: false,
    wsibEi: false,
    vacationTimeOff: "",
    sickTimeOff: "",
    personalTimeOff: "",
    exemptions: "",
    additionalEarnings: additionalJobAssignments.map((assignment) => ({
      jobEarningCodeId: assignment.earningCodeId,
      jobPayRate: assignment.payRate?.toString() || "",
      jobHoursPerWeek: assignment.hoursPerWeek?.toString() || "",
    })),
    contributorySelections: employeeContributorySelections.map((selection) => ({
      contributoryCodeId: selection.contributoryCodeId,
      deductionAmount: formatPerPayAmount(
        selection.deductionAmount,
        contributoryPayPeriodsPerYear,
      ),
      participationAmount: formatPerPayAmount(
        selection.participationAmount,
        contributoryPayPeriodsPerYear,
      ),
    })),
    status: employee?.status || "ACTIVE",
    email: contact.emails[0]?.emailAddress || "",
    phone: formatPhone(contact.phones[0]?.number) || "",
    street: contact.addresses[0]?.street || "",
    city: contact.addresses[0]?.city || "",
    province: contact.addresses[0]?.province || "ON",
    postalCode: formatPostalCode(contact.addresses[0]?.postalCode) || "",
    country: contact.addresses[0]?.country || "Canada",
    bankAccounts:
      bankAccounts.length > 0
        ? ensureMinimumBankRows(
            bankAccounts.map((account) => ({
              id: account.id,
              institutionNumber: String(account.institutionNumber).padStart(
                3,
                "0",
              ),
              bankDetails: `${String(account.branchNumber).padStart(5, "0")}-${account.accountNumber}`,
              distributionType: account.type || undefined,
              distributionValue: account.value?.toString() || "",
            })),
          )
        : ensureMinimumBankRows([
            {
              ...blankBankAccount,
              distributionType: "PERCENTAGE",
              distributionValue: "100",
            },
          ]),
  };

  const bankAccountStatuses =
    bankAccounts.length > 0
      ? [
          ...bankAccounts.map((a) => a.verificationStatus),
          ...Array.from(
            { length: Math.max(0, 1 - bankAccounts.length) },
            () => "UNVERIFIED" as const,
          ),
        ]
      : (["UNVERIFIED"] as const);

  return (
    <EditEmployeeForm
      paramsPromise={params}
      initialData={initialData}
      bankAccountStatuses={bankAccountStatuses}
      earningCodeOptions={earningCodeOptions}
      payrollUnitOptions={payrollUnitOptions}
      contributoryCodeOptions={contributoryCodeOptions.map((option) => ({
        id: option.id,
        code: option.code,
        description: option.description,
        employeeExcludedEarnings: option.employeeExemptEarnings.toString(),
        employeeCapAmount: option.employeeDeductionLimit?.toString() ?? null,
        defaultDeductionAmount: option.employeeDeductionRate.toString(),
        defaultParticipationAmount:
          option.employerParticipationRate?.toString() ?? "",
      }))}
      tenantId={tenantId}
      employerName={employerName}
    />
  );
}
