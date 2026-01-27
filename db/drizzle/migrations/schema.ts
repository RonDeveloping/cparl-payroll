import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  boolean,
  index,
  foreignKey,
  jsonb,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bytea } from "../customTypes";

export const accountCategory = pgEnum("account_category", [
  "cash",
  "payroll_expense",
  "tax_payable",
  "benefit_payable",
  "wages_payable",
  "other",
]);
export const accountType = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);
export const conversationalNameSource = pgEnum("conversational_name_source", [
  "user",
  "support",
  "import",
  "system",
]);
export const deductionType = pgEnum("deduction_type", [
  "tax",
  "cpp",
  "ei",
  "benefit",
  "other",
]);
export const disbursementStatus = pgEnum("disbursement_status", [
  "pending",
  "sent",
  "failed",
  "reconciled",
]);
export const distributionType = pgEnum("distribution_type", [
  "fixed_amount",
  "percentage",
  "remainder",
]);
export const earningType = pgEnum("earning_type", [
  "regular",
  "overtime",
  "bonus",
  "commission",
  "other",
]);
export const employeeStatus = pgEnum("employee_status", [
  "active",
  "terminated",
  "on_leave",
]);
export const mappingType = pgEnum("mapping_type", [
  "earning",
  "deduction",
  "employer_tax",
  "net_pay_clearing",
]);
export const payFrequency = pgEnum("pay_frequency", [
  "weekly",
  "biweekly",
  "semimonthly",
  "monthly",
]);
export const payType = pgEnum("pay_type", ["hourly", "salary"]);
export const payrollRunStatus = pgEnum("payroll_run_status", [
  "draft",
  "finalized",
  "paid",
]);
export const phoneType = pgEnum("phone_type", ["mobile", "home", "work"]);

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
  "user",
  {
    id: text().primaryKey().notNull(),
    slug: text().notNull(),
    displayName: text("display_name").notNull(),
    securityEmail: text("security_email").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", {
      precision: 3,
      mode: "string",
    }),
    pendingSecurityEmail: text("pending_security_email"),
    passwordHash: text("password_hash"),
    contactId: text("contact_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("user_contact_id_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_security_email_key").using(
      "btree",
      table.securityEmail.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const contact = pgTable("contact", {
  id: text().primaryKey().notNull(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  middleName: text("middle_name"),
  suffix: text(),
  prefix: text(),
  nickName: text("nick_name"),
  displayName: text("display_name"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    precision: 3,
    mode: "string",
  }).notNull(),
});

export const legalNameHistory = pgTable(
  "legal_name_history",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    middleName: text("middle_name"),
    effectiveFrom: timestamp("effective_from", {
      precision: 3,
      mode: "string",
    }).notNull(),
    effectiveTo: timestamp("effective_to", { precision: 3, mode: "string" }),
    changedBy: text("changed_by"),
    reason: text(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("legal_name_history_contact_id_effective_from_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.effectiveFrom.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "legal_name_history_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const conversationalNameHistory = pgTable(
  "conversational_name_history",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    suffix: text(),
    prefix: text(),
    nickName: text("nick_name"),
    displayName: text("display_name"),
    source: conversationalNameSource(),
    effectiveFrom: timestamp("effective_from", {
      precision: 3,
      mode: "string",
    }).notNull(),
    effectiveTo: timestamp("effective_to", { precision: 3, mode: "string" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("conversational_name_history_contact_id_effective_from_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.effectiveFrom.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "conversational_name_history_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const address = pgTable(
  "address",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    street: text().notNull(),
    city: text().notNull(),
    province: text().notNull(),
    postalCode: text("postal_code").notNull(),
    country: text().notNull(),
    addressHash: text("address_hash").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("address_contact_id_address_hash_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.addressHash.asc().nullsLast().op("text_ops"),
    ),
    index("address_contact_id_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "address_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const email = pgTable(
  "email",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    emailAddress: text("email_address").notNull(),
  },
  (table) => [
    uniqueIndex("email_contact_id_email_address_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.emailAddress.asc().nullsLast().op("text_ops"),
    ),
    index("email_contact_id_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "email_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const phone = pgTable(
  "phone",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    number: text().notNull(),
    type: phoneType().default("mobile"),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    index("phone_contact_id_idx").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("phone_contact_id_number_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
      table.number.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "phone_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const employee = pgTable(
  "employee",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    contactId: text("contact_id").notNull(),
    employeeNumber: text("employee_number"),
    taxIdEncrypted: bytea("tax_id_encrypted").notNull(),
    taxIdLast4: text("tax_id_last_4").notNull(),
    dateOfBirth: timestamp("date_of_birth", {
      precision: 3,
      mode: "string",
    }).notNull(),
    hireDate: timestamp("hire_date", {
      precision: 3,
      mode: "string",
    }).notNull(),
    status: employeeStatus().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    addressCached: jsonb("address_cached").notNull(),
    emailCached: text("email_cached"),
    phoneCached: jsonb("phone_cached"),
    nameCached: jsonb("name_cached").notNull(),
  },
  (table) => [
    uniqueIndex("employee_tenant_id_contact_id_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("employee_tenant_id_employee_number_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.employeeNumber.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const employment = pgTable(
  "employment",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    employeeId: text("employee_id").notNull(),
    title: text(),
    department: text(),
    startDate: timestamp("start_date", {
      precision: 3,
      mode: "string",
    }).notNull(),
    endDate: timestamp("end_date", { precision: 3, mode: "string" }),
    countryCode: text("country_code").default("CA").notNull(),
    provinceCode: text("province_code").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("employment_employee_id_start_date_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("timestamp_ops"),
    ),
    index("employment_tenant_id_employee_id_start_date_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("timestamp_ops"),
      table.employeeId.asc().nullsLast().op("timestamp_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "employment_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const jobAssignment = pgTable(
  "job_assignment",
  {
    id: text().primaryKey().notNull(),
    employmentId: text("employment_id").notNull(),
    startDate: timestamp("start_date", {
      precision: 3,
      mode: "string",
    }).notNull(),
    endDate: timestamp("end_date", { precision: 3, mode: "string" }),
    payRate: numeric("pay_rate", { precision: 10, scale: 2 }).notNull(),
    payType: payType("pay_type").notNull(),
  },
  (table) => [
    index("job_assignment_employment_id_start_date_idx").using(
      "btree",
      table.employmentId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employmentId],
      foreignColumns: [employment.id],
      name: "job_assignment_employment_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const timeEntry = pgTable(
  "time_entry",
  {
    id: text().primaryKey().notNull(),
    jobAssignmentId: text("job_assignment_id").notNull(),
    workDate: timestamp("work_date", {
      precision: 3,
      mode: "string",
    }).notNull(),
    hours: numeric({ precision: 6, scale: 2 }).notNull(),
  },
  (table) => [
    index("time_entry_job_assignment_id_work_date_idx").using(
      "btree",
      table.jobAssignmentId.asc().nullsLast().op("text_ops"),
      table.workDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.jobAssignmentId],
      foreignColumns: [jobAssignment.id],
      name: "time_entry_job_assignment_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollRun = pgTable(
  "payroll_run",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    periodStart: timestamp("period_start", {
      precision: 3,
      mode: "string",
    }).notNull(),
    periodEnd: timestamp("period_end", {
      precision: 3,
      mode: "string",
    }).notNull(),
    runDate: timestamp("run_date", { precision: 3, mode: "string" }).notNull(),
    status: payrollRunStatus().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("payroll_run_tenant_id_period_start_period_end_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.periodStart.asc().nullsLast().op("text_ops"),
      table.periodEnd.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const payrollRunEmployee = pgTable(
  "payroll_run_employee",
  {
    id: text().primaryKey().notNull(),
    payrollRunId: text("payroll_run_id").notNull(),
    employeeId: text("employee_id").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    addressSnapshot: text("address_snapshot").notNull(),
    grossPay: numeric("gross_pay", { precision: 10, scale: 2 }).notNull(),
    deductions: numeric({ precision: 10, scale: 2 }).notNull(),
    netPay: numeric("net_pay", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("payroll_run_employee_payroll_run_id_employee_id_key").using(
      "btree",
      table.payrollRunId.asc().nullsLast().op("text_ops"),
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunId],
      foreignColumns: [payrollRun.id],
      name: "payroll_run_employee_payroll_run_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "payroll_run_employee_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollLine = pgTable(
  "payroll_line",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text("payroll_run_employee_id").notNull(),
    jobAssignmentId: text("job_assignment_id"),
    rate: numeric({ precision: 10, scale: 2 }).notNull(),
    units: numeric({ precision: 6, scale: 2 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    earningType: earningType("earning_type").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "payroll_line_payroll_run_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.jobAssignmentId],
      foreignColumns: [jobAssignment.id],
      name: "payroll_line_job_assignment_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const deduction = pgTable(
  "deduction",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text("payroll_run_employee_id").notNull(),
    type: deductionType().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("deduction_payroll_run_employee_id_type_key").using(
      "btree",
      table.payrollRunEmployeeId.asc().nullsLast().op("text_ops"),
      table.type.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "deduction_payroll_run_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const bankAccount = pgTable(
  "bank_account",
  {
    id: text().primaryKey().notNull(),
    employeeId: text("employee_id").notNull(),
    institutionNumber: integer("institution_number").notNull(),
    branchNumber: integer("branch_number").notNull(),
    accountNumber: text("account_number").notNull(),
    currency: text().default("CAD").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    type: distributionType().default("remainder").notNull(),
    value: numeric({ precision: 10, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("bank_account_employee_id_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "bank_account_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollDisbursement = pgTable(
  "payroll_disbursement",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text("payroll_run_employee_id").notNull(),
    institutionNumber: integer("institution_number").notNull(),
    branchNumber: integer("branch_number").notNull(),
    accountNumber: text("account_number").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    status: disbursementStatus().default("pending").notNull(),
    processedAt: timestamp("processed_at", { precision: 3, mode: "string" }),
  },
  (table) => [
    index("payroll_disbursement_payroll_run_employee_id_idx").using(
      "btree",
      table.payrollRunEmployeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "payroll_disbursement_payroll_run_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const tenant = pgTable(
  "tenant",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    legalName: text("legal_name").notNull(),
    businessNumber: text("business_number"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("tenant_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const tenantSettings = pgTable(
  "tenant_settings",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    timezone: text().default("America/Toronto").notNull(),
  },
  (table) => [
    uniqueIndex("tenant_settings_tenant_id_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "tenant_settings_tenant_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollCycle = pgTable(
  "payroll_cycle",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    frequency: payFrequency().notNull(),
  },
  (table) => [
    index("payroll_cycle_tenant_id_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "payroll_cycle_tenant_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const department = pgTable(
  "department",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    name: text().notNull(),
    code: text(),
  },
  (table) => [
    uniqueIndex("department_tenant_id_code_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.code.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "department_tenant_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const chartOfAccount = pgTable(
  "chart_of_account",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    code: text().notNull(),
    name: text().notNull(),
    type: accountType().notNull(),
    category: accountCategory().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("chart_of_account_tenant_id_code_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.code.asc().nullsLast().op("text_ops"),
    ),
    index("chart_of_account_tenant_id_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const glMapping = pgTable(
  "gl_mapping",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    chartOfAccountId: text("chart_of_account_id").notNull(),
    mappingType: mappingType("mapping_type").notNull(),
    earningType: earningType("earning_type"),
    deductionType: deductionType("deduction_type"),
    departmentId: text("department_id"),
  },
  (table) => [
    index("gl_mapping_tenant_id_mapping_type_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.mappingType.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.chartOfAccountId],
      foreignColumns: [chartOfAccount.id],
      name: "gl_mapping_chart_of_account_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);
