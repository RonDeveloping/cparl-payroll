import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  index,
  foreignKey,
  boolean,
  uniqueIndex,
  numeric,
  jsonb,
  char,
  check,
  primaryKey,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const distributionType = pgEnum("DistributionType", [
  "fixed_amount",
  "percentage",
  "remainder",
]);
export const employeeStatus = pgEnum("EmployeeStatus", [
  "active",
  "terminated",
  "on_leave",
]);
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
export const bankAccountVerificationStatus = pgEnum(
  "bank_account_verification_status",
  ["unverified", "pending", "verified", "failed"],
);
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
export const earningType = pgEnum("earning_type", [
  "regular",
  "overtime",
  "bonus",
  "commission",
  "other",
]);
export const entryType = pgEnum("entry_type", ["debit", "credit"]);
export const journalStatus = pgEnum("journal_status", [
  "pending",
  "posted",
  "failed",
  "voided",
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
  "annually",
]);
export const payType = pgEnum("pay_type", ["hourly", "salary"]);
export const payrollRunStatus = pgEnum("payroll_run_status", [
  "draft",
  "finalized",
  "paid",
]);
export const phoneType = pgEnum("phone_type", ["mobile", "home", "work"]);
export const remittanceStatus = pgEnum("remittance_status", [
  "pending",
  "reviewed",
  "filed",
  "paid",
  "cancelled",
]);
export const subject = pgEnum("subject", ["organization", "individual"]);
export const terminationReason = pgEnum("termination_reason", [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "M",
  "N",
  "P",
  "Z",
]);
export const tokenType = pgEnum("token_type", [
  "email_verification",
  "password_reset",
  "email_change",
]);
export const userRole = pgEnum("user_role", [
  "owner",
  "admin",
  "manager",
  "accountant",
  "employee",
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

export const paymentCard = pgTable(
  "payment_card",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    brand: text().notNull(),
    last4: text().notNull(),
    expMonth: integer("exp_month").notNull(),
    expYear: integer("exp_year").notNull(),
    cardholderName: text("cardholder_name"),
    billingPostalCode: text("billing_postal_code"),
    paymentMethodId: text("payment_method_id").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("payment_card_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "payment_card_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const verificationEmailToken = pgTable(
  "verification_email_token",
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    token: text().notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("verification_email_token_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("verification_email_token_token_idx").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("verification_email_token_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    slug: text().notNull(),
    emailVerifiedAt: timestamp("email_verified_at", {
      precision: 3,
      mode: "string",
    }),
    passwordHash: text("password_hash"),
    contactId: text("contact_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    email: text().notNull(),
    pendingPhone: text("pending_phone"),
    phone: text(),
    phoneVerifiedAt: timestamp("phone_verified_at", {
      precision: 3,
      mode: "string",
    }),
    last2FaAt: timestamp("last_2fa_at", { precision: 3, mode: "string" }),
    candidateEmail: text("candidate_email"),
    termsAcceptedAt: timestamp("terms_accepted_at", {
      precision: 3,
      mode: "string",
    }),
    termsVersionAccepted: text("terms_version_accepted"),
  },
  (table) => [
    uniqueIndex("user_contact_id_key").using(
      "btree",
      table.contactId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_phone_key").using(
      "btree",
      table.phone.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
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
    status: payrollRunStatus().default("draft").notNull(),
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
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "payroll_run_employee_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.payrollRunId],
      foreignColumns: [payrollRun.id],
      name: "payroll_run_employee_payroll_run_id_fkey",
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
      columns: [table.jobAssignmentId],
      foreignColumns: [jobAssignment.id],
      name: "payroll_line_job_assignment_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "payroll_line_payroll_run_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
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

export const tenant = pgTable(
  "tenant",
  {
    id: text().primaryKey().notNull(),
    slug: text().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    contactId: text("contact_id").notNull(),
    nameCached: jsonb("name_cached").notNull(),
    businessBn9: char("business_bn9", { length: 9 }),
    businessProgramId: char("business_program_id", { length: 2 }),
    businessAccountRef: char("business_account_ref", { length: 4 }),
  },
  (table) => [
    index(
      "tenant_business_bn9_business_program_id_business_account_re_idx",
    ).using(
      "btree",
      table.businessBn9.asc().nullsLast().op("bpchar_ops"),
      table.businessProgramId.asc().nullsLast().op("bpchar_ops"),
      table.businessAccountRef.asc().nullsLast().op("bpchar_ops"),
    ),
    uniqueIndex("tenant_slug_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
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
    terminationReason: terminationReason("termination_reason"),
  },
  (table) => [
    index("employment_employee_id_start_date_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    index("employment_tenant_id_employee_id_start_date_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("timestamp_ops"),
      table.employeeId.asc().nullsLast().op("text_ops"),
      table.startDate.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "employment_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    check(
      "employment_termination_consistency_check",
      sql`((end_date IS NULL) AND (termination_reason IS NULL)) OR ((end_date IS NOT NULL) AND (termination_reason IS NOT NULL))`,
    ),
  ],
);

export const contact = pgTable("contact", {
  id: text().primaryKey().notNull(),
  middleName: text("middle_name"),
  suffix: text(),
  prefix: text(),
  displayName: text("display_name"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    precision: 3,
    mode: "string",
  }).notNull(),
  aliasName: text("alias_name"),
  coreName: text("core_name").notNull(),
  kindName: text("kind_name").notNull(),
  source: conversationalNameSource(),
  subject: subject().notNull(),
});

export const conversationalNameHistory = pgTable(
  "conversational_name_history",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
    suffix: text(),
    prefix: text(),
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
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    aliasName: text("alias_name"),
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
    status: employeeStatus().default("active").notNull(),
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

export const legalNameHistory = pgTable(
  "legal_name_history",
  {
    id: text().primaryKey().notNull(),
    contactId: text("contact_id").notNull(),
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
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    coreName: text("core_name").notNull(),
    kindName: text("kind_name").notNull(),
    source: conversationalNameSource(),
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

export const paySlips = pgTable(
  "pay_slips",
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    s3Key: text("s3_key").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    employeeId: text("employee_id").notNull(),
    tenantId: text("tenant_id").notNull(),
  },
  (table) => [
    index("pay_slips_employee_id_created_at_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("pay_slips_employee_id_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    index("pay_slips_tenant_id_created_at_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.asc().nullsLast().op("text_ops"),
    ),
    index("pay_slips_tenant_id_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const payrollDisbursements = pgTable(
  "payroll_disbursements",
  {
    id: text().primaryKey().notNull(),
    payrollRunEmployeeId: text("payroll_run_employee_id").notNull(),
    institutionNumber: integer("institution_number").notNull(),
    branchNumber: integer("branch_number").notNull(),
    accountNumber: text("account_number").notNull(),
    bankLabel: text("bank_label"),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    status: disbursementStatus().default("pending").notNull(),
    referenceNumber: text("reference_number"),
    processedAt: timestamp("processed_at", { precision: 3, mode: "string" }),
  },
  (table) => [
    index("payroll_disbursements_payroll_run_employee_id_idx").using(
      "btree",
      table.payrollRunEmployeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.payrollRunEmployeeId],
      foreignColumns: [payrollRunEmployee.id],
      name: "payroll_disbursements_payroll_run_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const payrollJournals = pgTable(
  "payroll_journals",
  {
    id: text().primaryKey().notNull(),
    payrollRunId: text("payroll_run_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    status: journalStatus().default("pending").notNull(),
    postedAt: timestamp("posted_at", { precision: 3, mode: "string" }),
    totalDebit: numeric("total_debit", { precision: 12, scale: 2 }).notNull(),
    totalCredit: numeric("total_credit", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("payroll_journals_payroll_run_id_key").using(
      "btree",
      table.payrollRunId.asc().nullsLast().op("text_ops"),
    ),
    index("payroll_journals_tenant_id_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: text().primaryKey().notNull(),
    payrollJournalId: text("payroll_journal_id").notNull(),
    glAccountNumber: text("gl_account_number"),
    glAccountName: text("gl_account_name").notNull(),
    type: entryType().notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    description: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.payrollJournalId],
      foreignColumns: [payrollJournals.id],
      name: "journal_entries_payroll_journal_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const remittances = pgTable(
  "remittances",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    totalGrossPayroll: numeric("total_gross_payroll", {
      precision: 12,
      scale: 2,
    }).notNull(),
    totalEmployees: integer("total_employees").notNull(),
    totalDue: numeric("total_due", { precision: 12, scale: 2 }).notNull(),
    status: remittanceStatus().default("pending").notNull(),
    paymentReference: text("payment_reference"),
    filedAt: timestamp("filed_at", { precision: 3, mode: "string" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("remittances_tenant_id_period_year_period_month_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("int4_ops"),
      table.periodYear.asc().nullsLast().op("int4_ops"),
      table.periodMonth.asc().nullsLast().op("int4_ops"),
    ),
    index("remittances_tenant_id_status_idx").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("enum_ops"),
    ),
  ],
);

export const phoneVerification = pgTable(
  "phone_verification",
  {
    id: text().primaryKey().notNull(),
    code: text().notNull(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("phone_verification_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("phone_verification_user_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "phone_verification_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const twoFactorCodes = pgTable(
  "two_factor_codes",
  {
    id: text().primaryKey().notNull(),
    code: text().notNull(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("two_factor_codes_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("two_factor_codes_user_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "two_factor_codes_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const tenantUser = pgTable(
  "tenant_user",
  {
    id: text().primaryKey().notNull(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: userRole().default("employee").notNull(),
  },
  (table) => [
    uniqueIndex("tenant_user_tenant_id_user_id_key").using(
      "btree",
      table.tenantId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    index("tenant_user_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [tenant.id],
      name: "tenant_user_tenant_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: text().primaryKey().notNull(),
    institutionNumber: integer("institution_number").notNull(),
    branchNumber: integer("branch_number").notNull(),
    accountNumber: text("account_number").notNull(),
    currency: text().default("CAD").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    label: text(),
    value: numeric({ precision: 10, scale: 2 }),
    priority: integer().default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    employeeId: text("employee_id").notNull(),
    type: distributionType().default("remainder").notNull(),
    verificationStatus: bankAccountVerificationStatus("verification_status")
      .default("unverified")
      .notNull(),
  },
  (table) => [
    index("bank_accounts_employee_id_idx").using(
      "btree",
      table.employeeId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "bank_accounts_employee_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const authToken = pgTable(
  "auth_token",
  {
    id: text().primaryKey().notNull(),
    token: text().notNull(),
    userId: text("user_id").notNull(),
    type: tokenType().default("email_verification").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    uniqueIndex("auth_token_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
    index("auth_token_user_id_type_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.type.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "auth_token_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const remittanceToPayrollRuns = pgTable(
  "remittance_to_payroll_runs",
  {
    remittanceId: text("remittance_id").notNull(),
    payrollRunId: text("payroll_run_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.remittanceId],
      foreignColumns: [remittances.id],
      name: "remittance_to_payroll_runs_remittance_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    primaryKey({
      columns: [table.payrollRunId, table.remittanceId],
      name: "remittance_to_payroll_runs_pkey",
    }),
  ],
);
