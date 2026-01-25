import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  serial,
  index,
  foreignKey,
  boolean,
  numeric,
  jsonb,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const accountCategory = pgEnum("AccountCategory", [
  "CASH",
  "PAYROLL_EXPENSE",
  "TAX_PAYABLE",
  "BENEFIT_PAYABLE",
  "WAGES_PAYABLE",
  "OTHER",
]);
export const accountType = pgEnum("AccountType", [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
]);
export const conversationalNameSource = pgEnum("ConversationalNameSource", [
  "USER",
  "SUPPORT",
  "IMPORT",
  "SYSTEM",
]);
export const deductionType = pgEnum("DeductionType", [
  "TAX",
  "CPP",
  "EI",
  "BENEFIT",
  "OTHER",
]);
export const disbursementStatus = pgEnum("DisbursementStatus", [
  "PENDING",
  "SENT",
  "FAILED",
  "RECONCILED",
]);
export const distributionType = pgEnum("DistributionType", [
  "FIXED_AMOUNT",
  "PERCENTAGE",
  "REMAINDER",
]);
export const earningType = pgEnum("EarningType", [
  "REGULAR",
  "OVERTIME",
  "BONUS",
  "COMMISSION",
  "OTHER",
]);
export const employeeStatus = pgEnum("EmployeeStatus", [
  "ACTIVE",
  "TERMINATED",
  "ON_LEAVE",
]);
export const entryType = pgEnum("EntryType", ["DEBIT", "CREDIT"]);
export const journalStatus = pgEnum("JournalStatus", [
  "PENDING",
  "POSTED",
  "FAILED",
  "VOIDED",
]);
export const mappingType = pgEnum("MappingType", [
  "EARNING",
  "DEDUCTION",
  "EMPLOYER_TAX",
  "NET_PAY_CLEARING",
]);
export const payFrequency = pgEnum("PayFrequency", [
  "WEEKLY",
  "BIWEEKLY",
  "SEMIMONTHLY",
  "MONTHLY",
]);
export const payType = pgEnum("PayType", ["HOURLY", "SALARY"]);
export const payrollRunStatus = pgEnum("PayrollRunStatus", [
  "DRAFT",
  "FINALIZED",
  "PAID",
]);
export const phoneType = pgEnum("PhoneType", ["MOBILE", "HOME", "WORK"]);
export const roeReasonCode = pgEnum("ROEReasonCode", [
  "A_SHORTAGE_OF_WORK",
  "B_STRIKE_LOCKOUT",
  "C_RETURN_TO_SCHOOL",
  "D_ILLNESS_INJURY",
  "E_QUIT",
  "F_MATERNITY",
  "G_RETIREMENT",
  "H_WORK_SHARING",
  "J_DISMISSAL",
  "M_DISMISSAL_PROBATION",
  "N_LEAVE_OF_ABSENCE",
  "P_PARENTAL",
  "OTHER",
]);
export const remittanceStatus = pgEnum("RemittanceStatus", [
  "PENDING",
  "REVIEWED",
  "FILED",
  "PAID",
  "CANCELLED",
]);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const user = pgTable(
  "User",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
  },
  (table) => [
    uniqueIndex("User_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const address = pgTable(
  "Address",
  {
    id: text().primaryKey().notNull(),
    street: text().notNull(),
    city: text().notNull(),
    province: text().notNull(),
    postalCode: text().notNull(),
    country: text().notNull(),
    isPrimary: boolean().default(false).notNull(),
    addressHash: text().notNull(),
    contactId: text().notNull(),
  },
  (table) => [
    uniqueIndex("Address_contactId_addressHash_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.addressHash.asc().nullsLast().op("text_ops"),
    ),
    index("Address_contactId_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "Address_contactId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const email = pgTable(
  "Email",
  {
    id: text().primaryKey().notNull(),
    isPrimary: boolean().default(false).notNull(),
    contactId: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    address: text().notNull(),
  },
  (table) => [
    uniqueIndex("Email_contactId_address_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.address.asc().nullsLast().op("text_ops"),
    ),
    index("Email_contactId_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "Email_contactId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const bankAccount = pgTable(
  "BankAccount",
  {
    id: text().primaryKey().notNull(),
    institutionNumber: integer().notNull(),
    branchNumber: integer().notNull(),
    accountNumber: text().notNull(),
    currency: text().default("CAD").notNull(),
    isPrimary: boolean().default(false).notNull(),
    employeeId: text().notNull(),
    isActive: boolean().default(true).notNull(),
    label: text(),
    priority: integer().default(1).notNull(),
    type: distributionType().default("REMAINDER").notNull(),
    value: numeric({ precision: 10, scale: 2 }),
  },
  (table) => [
    index("BankAccount_employeeId_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "BankAccount_employeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const phone = pgTable(
  "Phone",
  {
    id: text().primaryKey().notNull(),
    number: text().notNull(),
    type: phoneType().default("MOBILE"),
    isPrimary: boolean().default(false).notNull(),
    contactId: text().notNull(),
  },
  (table) => [
    index("Phone_contactId_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("Phone_contactId_number_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.number.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "Phone_contactId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const statHoliday = pgTable(
  "StatHoliday",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    date: timestamp({ precision: 3, mode: "string" }).notNull(),
    name: text().notNull(),
    isPaid: boolean().notNull(),
    provinceCode: text().default("CA").notNull(),
  },
  (table) => [
    index("StatHoliday_tenantId_date_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.date.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("StatHoliday_tenantId_date_provinceCode_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.date.asc().nullsLast().op("text_ops"),
      table.provinceCode.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const paySlip = pgTable(
  "PaySlip",
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    s3Key: text().notNull(),
    fileName: text().notNull(),
    fileSize: integer().notNull(),
    employeeId: text().notNull(),
    tenantId: text().notNull(),
  },
  (table) => [
    index("PaySlip_employeeId_createdAt_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("PaySlip_employeeId_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    index("PaySlip_tenantId_createdAt_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("PaySlip_tenantId_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const contact = pgTable("Contact", {
  id: text().primaryKey().notNull(),
  givenName: text().notNull(),
  familyName: text().notNull(),
  middleName: text(),
  suffix: text(),
  prefix: text(),
  nickName: text(),
  displayName: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
});

export const legalNameHistory = pgTable(
  "LegalNameHistory",
  {
    id: text().primaryKey().notNull(),
    contactId: text().notNull(),
    givenName: text().notNull(),
    familyName: text().notNull(),
    middleName: text(),
    effectiveFrom: timestamp({ precision: 3, mode: "string" }).notNull(),
    effectiveTo: timestamp({ precision: 3, mode: "string" }),
    changedBy: text(),
    reason: text(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("LegalNameHistory_contactId_effectiveFrom_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.effectiveFrom.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "LegalNameHistory_contactId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const conversationalNameHistory = pgTable(
  "ConversationalNameHistory",
  {
    id: text().primaryKey().notNull(),
    contactId: text().notNull(),
    suffix: text(),
    prefix: text(),
    nickName: text(),
    displayName: text(),
    source: conversationalNameSource(),
    effectiveFrom: timestamp({ precision: 3, mode: "string" }).notNull(),
    effectiveTo: timestamp({ precision: 3, mode: "string" }),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("ConversationalNameHistory_contactId_effectiveFrom_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.effectiveFrom.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "ConversationalNameHistory_contactId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const employee = pgTable(
  "Employee",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    contactId: text().notNull(),
    employeeNumber: text(),
    // TODO: failed to parse database type 'bytea'
    taxIdEncrypted: text().notNull(),
    taxIdLast4: text().notNull(),
    dateOfBirth: timestamp({ precision: 3, mode: "string" }).notNull(),
    hireDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    status: employeeStatus().notNull(),
    terminationDate: timestamp({ precision: 3, mode: "string" }),
    terminationReason: roeReasonCode(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    addressCached: jsonb().notNull(),
    emailCached: text(),
    phoneCached: jsonb(),
    nameCached: jsonb().notNull(),
  },
  (table) => [
    uniqueIndex("Employee_tenantId_contactId_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("Employee_tenantId_employeeNumber_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.employeeNumber.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const employment = pgTable(
  "Employment",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    employeeId: text().notNull(),
    title: text(),
    department: text(),
    startDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    endDate: timestamp({ precision: 3, mode: "string" }),
    countryCode: text().default("CA").notNull(),
    provinceCode: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("Employment_employeeId_startDate_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("timestamp_ops"),
    ),
    index("Employment_tenantId_employeeId_startDate_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("timestamp_ops"),
      table.employeeId.asc().nullsLast().op("timestamp_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "Employment_employeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const jobAssignment = pgTable(
  "JobAssignment",
  {
    id: text().primaryKey().notNull(),
    employmentId: text().notNull(),
    departmentId: text(),
    costCenterId: text(),
    projectCode: text(),
    startDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    endDate: timestamp({ precision: 3, mode: "string" }),
    payRate: numeric({ precision: 10, scale: 2 }).notNull(),
    payType: payType().notNull(),
  },
  (table) => [
    index("JobAssignment_employmentId_startDate_idx").using(
      "btree",
      table.employmentId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employmentId],
      foreignColumns: [employment.id],
      name: "JobAssignment_employmentId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const timeEntry = pgTable(
  "TimeEntry",
  {
    id: text().primaryKey().notNull(),
    jobAssignmentId: text().notNull(),
    workDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    hours: numeric({ precision: 6, scale: 2 }).notNull(),
  },
  (table) => [
    index("TimeEntry_jobAssignmentId_workDate_idx").using(
      "btree",
      table.jobAssignmentId.asc().nullsLast().op("text_ops"),
      table.workDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.jobAssignmentId],
      foreignColumns: [jobAssignment.id],
      name: "TimeEntry_jobAssignmentId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollRun = pgTable(
  "PayrollRun",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    periodStart: timestamp({ precision: 3, mode: "string" }).notNull(),
    periodEnd: timestamp({ precision: 3, mode: "string" }).notNull(),
    runDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    status: payrollRunStatus().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("PayrollRun_tenantId_periodStart_periodEnd_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.periodStart.asc().nullsLast().op("text_ops"),
      table.periodEnd.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const payrollRunEmployee = pgTable(
  "PayrollRunEmployee",
  {
    id: text().primaryKey().notNull(),
    payrollRunId: text().notNull(),
    employeeId: text().notNull(),
    nameSnapshot: text().notNull(),
    addressSnapshot: text().notNull(),
    grossPay: numeric({ precision: 10, scale: 2 }).notNull(),
    deductions: numeric({ precision: 10, scale: 2 }).notNull(),
    netPay: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("PayrollRunEmployee_payrollRunId_employeeId_key").using(
      "btree",
      table.payrollRunId.asc().nullsLast().op("text_ops"),
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunId],
      foreignColumns: [payrollRun.id],
      name: "PayrollRunEmployee_payrollRunId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "PayrollRunEmployee_employeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollLine = pgTable(
  "PayrollLine",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text().notNull(),
    jobAssignmentId: text(),
    rate: numeric({ precision: 10, scale: 2 }).notNull(),
    units: numeric({ precision: 6, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    earningType: earningType().notNull(),
    costCenterId: text(),
    departmentId: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "PayrollLine_payrollRunEmployeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.jobAssignmentId],
      foreignColumns: [jobAssignment.id],
      name: "PayrollLine_jobAssignmentId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const deduction = pgTable(
  "Deduction",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text().notNull(),
    type: deductionType().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("Deduction_payrollRunEmployeeId_type_key").using(
      "btree",
      table.payrollRunEmployeeId.asc().nullsLast().op("text_ops"),
      table.type.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "Deduction_payrollRunEmployeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollDisbursement = pgTable(
  "PayrollDisbursement",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text().notNull(),
    institutionNumber: integer().notNull(),
    branchNumber: integer().notNull(),
    accountNumber: text().notNull(),
    bankLabel: text(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    status: disbursementStatus().default("PENDING").notNull(),
    referenceNumber: text(),
    processedAt: timestamp({ precision: 3, mode: "string" }),
  },
  (table) => [
    index("PayrollDisbursement_payrollRunEmployeeId_idx").using(
      "btree",
      table.payrollRunEmployeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "PayrollDisbursement_payrollRunEmployeeId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollJournal = pgTable(
  "PayrollJournal",
  {
    id: text().primaryKey().notNull(),
    payrollRunId: text().notNull(),
    tenantId: text().notNull(),
    status: journalStatus().default("PENDING").notNull(),
    postedAt: timestamp({ precision: 3, mode: "string" }),
    totalDebit: numeric({ precision: 12, scale: 2 }).notNull(),
    totalCredit: numeric({ precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("PayrollJournal_payrollRunId_key").using(
      "btree",
      table.payrollRunId.asc().nullsLast().op("text_ops"),
    ),
    index("PayrollJournal_tenantId_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const journalEntry = pgTable(
  "JournalEntry",
  {
    id: text().primaryKey().notNull(),
    payrollJournalId: text().notNull(),
    glAccountNumber: text(),
    glAccountName: text().notNull(),
    type: entryType().notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    description: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.payrollJournalId],
      foreignColumns: [payrollJournal.id],
      name: "JournalEntry_payrollJournalId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const remittance = pgTable(
  "Remittance",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    periodYear: integer().notNull(),
    periodMonth: integer().notNull(),
    totalGrossPayroll: numeric({ precision: 12, scale: 2 }).notNull(),
    totalEmployees: integer().notNull(),
    totalDue: numeric({ precision: 12, scale: 2 }).notNull(),
    status: remittanceStatus().default("PENDING").notNull(),
    paymentReference: text(),
    filedAt: timestamp({ precision: 3, mode: "string" }),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("Remittance_tenantId_periodYear_periodMonth_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("int4_ops"),
      table.periodYear.asc().nullsLast().op("int4_ops"),
      table.periodMonth.asc().nullsLast().op("int4_ops"),
    ),
    index("Remittance_tenantId_status_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("enum_ops"),
      table.status.asc().nullsLast().op("enum_ops"),
    ),
  ],
);

export const tenant = pgTable(
  "Tenant",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    legalName: text().notNull(),
    businessNumber: text(),
    industry: text(),
    baseCurrency: text().default("CAD").notNull(),
    standardWorkDayHours: numeric({ precision: 4, scale: 2 })
      .default("8.0")
      .notNull(),
    standardWorkWeekHours: numeric({ precision: 4, scale: 2 })
      .default("40.0")
      .notNull(),
    remittanceFrequency: payFrequency().default("MONTHLY").notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("Tenant_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const tenantSettings = pgTable(
  "TenantSettings",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    enableGarnishments: boolean().default(true).notNull(),
    autoApproveTime: boolean().default(false).notNull(),
    timezone: text().default("America/Toronto").notNull(),
    dateFormat: text().default("YYYY-MM-DD").notNull(),
  },
  (table) => [
    uniqueIndex("TenantSettings_tenantId_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "TenantSettings_tenantId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollCycle = pgTable(
  "PayrollCycle",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    name: text().notNull(),
    frequency: payFrequency().notNull(),
    firstPeriodStart: timestamp({ precision: 3, mode: "string" }).notNull(),
    firstPayDate: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    index("PayrollCycle_tenantId_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "PayrollCycle_tenantId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const department = pgTable(
  "Department",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    name: text().notNull(),
    code: text(),
  },
  (table) => [
    uniqueIndex("Department_tenantId_code_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.code.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "Department_tenantId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const chartOfAccount = pgTable(
  "ChartOfAccount",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    code: text().notNull(),
    name: text().notNull(),
    description: text(),
    type: accountType().notNull(),
    category: accountCategory().notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("ChartOfAccount_tenantId_code_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.code.asc().nullsLast().op("text_ops"),
    ),
    index("ChartOfAccount_tenantId_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const glMapping = pgTable(
  "GLMapping",
  {
    id: text().primaryKey().notNull(),
    tenantId: text().notNull(),
    chartOfAccountId: text().notNull(),
    mappingType: mappingType().notNull(),
    earningType: earningType(),
    deductionType: deductionType(),
    departmentId: text(),
  },
  (table) => [
    index("GLMapping_tenantId_mappingType_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.mappingType.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.chartOfAccountId],
      foreignColumns: [chartOfAccount.id],
      name: "GLMapping_chartOfAccountId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const remittanceToPayrollRun = pgTable(
  "RemittanceToPayrollRun",
  {
    remittanceId: text().notNull(),
    payrollRunId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.remittanceId],
      foreignColumns: [remittance.id],
      name: "RemittanceToPayrollRun_remittanceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    primaryKey({
      columns: [table.remittanceId, table.payrollRunId],
      name: "RemittanceToPayrollRun_pkey",
    }),
  ],
);
