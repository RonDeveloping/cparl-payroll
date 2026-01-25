-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."AccountCategory" AS ENUM('CASH', 'PAYROLL_EXPENSE', 'TAX_PAYABLE', 'BENEFIT_PAYABLE', 'WAGES_PAYABLE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."AccountType" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."ConversationalNameSource" AS ENUM('USER', 'SUPPORT', 'IMPORT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."DeductionType" AS ENUM('TAX', 'CPP', 'EI', 'BENEFIT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."DisbursementStatus" AS ENUM('PENDING', 'SENT', 'FAILED', 'RECONCILED');--> statement-breakpoint
CREATE TYPE "public"."DistributionType" AS ENUM('FIXED_AMOUNT', 'PERCENTAGE', 'REMAINDER');--> statement-breakpoint
CREATE TYPE "public"."EarningType" AS ENUM('REGULAR', 'OVERTIME', 'BONUS', 'COMMISSION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."EmployeeStatus" AS ENUM('ACTIVE', 'TERMINATED', 'ON_LEAVE');--> statement-breakpoint
CREATE TYPE "public"."EntryType" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."JournalStatus" AS ENUM('PENDING', 'POSTED', 'FAILED', 'VOIDED');--> statement-breakpoint
CREATE TYPE "public"."MappingType" AS ENUM('EARNING', 'DEDUCTION', 'EMPLOYER_TAX', 'NET_PAY_CLEARING');--> statement-breakpoint
CREATE TYPE "public"."PayFrequency" AS ENUM('WEEKLY', 'BIWEEKLY', 'SEMIMONTHLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."PayType" AS ENUM('HOURLY', 'SALARY');--> statement-breakpoint
CREATE TYPE "public"."PayrollRunStatus" AS ENUM('DRAFT', 'FINALIZED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."PhoneType" AS ENUM('MOBILE', 'HOME', 'WORK');--> statement-breakpoint
CREATE TYPE "public"."ROEReasonCode" AS ENUM('A_SHORTAGE_OF_WORK', 'B_STRIKE_LOCKOUT', 'C_RETURN_TO_SCHOOL', 'D_ILLNESS_INJURY', 'E_QUIT', 'F_MATERNITY', 'G_RETIREMENT', 'H_WORK_SHARING', 'J_DISMISSAL', 'M_DISMISSAL_PROBATION', 'N_LEAVE_OF_ABSENCE', 'P_PARENTAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."RemittanceStatus" AS ENUM('PENDING', 'REVIEWED', 'FILED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Address" (
	"id" text PRIMARY KEY NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postalCode" text NOT NULL,
	"country" text NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"addressHash" text NOT NULL,
	"contactId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Email" (
	"id" text PRIMARY KEY NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"contactId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BankAccount" (
	"id" text PRIMARY KEY NOT NULL,
	"institutionNumber" integer NOT NULL,
	"branchNumber" integer NOT NULL,
	"accountNumber" text NOT NULL,
	"currency" text DEFAULT 'CAD' NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"employeeId" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"label" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"type" "DistributionType" DEFAULT 'REMAINDER' NOT NULL,
	"value" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "Phone" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"type" "PhoneType" DEFAULT 'MOBILE',
	"isPrimary" boolean DEFAULT false NOT NULL,
	"contactId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StatHoliday" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"date" timestamp(3) NOT NULL,
	"name" text NOT NULL,
	"isPaid" boolean NOT NULL,
	"provinceCode" text DEFAULT 'CA' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaySlip" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"s3Key" text NOT NULL,
	"fileName" text NOT NULL,
	"fileSize" integer NOT NULL,
	"employeeId" text NOT NULL,
	"tenantId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Contact" (
	"id" text PRIMARY KEY NOT NULL,
	"givenName" text NOT NULL,
	"familyName" text NOT NULL,
	"middleName" text,
	"suffix" text,
	"prefix" text,
	"nickName" text,
	"displayName" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LegalNameHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"contactId" text NOT NULL,
	"givenName" text NOT NULL,
	"familyName" text NOT NULL,
	"middleName" text,
	"effectiveFrom" timestamp(3) NOT NULL,
	"effectiveTo" timestamp(3),
	"changedBy" text,
	"reason" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ConversationalNameHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"contactId" text NOT NULL,
	"suffix" text,
	"prefix" text,
	"nickName" text,
	"displayName" text,
	"source" "ConversationalNameSource",
	"effectiveFrom" timestamp(3) NOT NULL,
	"effectiveTo" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Employee" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"contactId" text NOT NULL,
	"employeeNumber" text,
	"taxIdEncrypted" "bytea" NOT NULL,
	"taxIdLast4" text NOT NULL,
	"dateOfBirth" timestamp(3) NOT NULL,
	"hireDate" timestamp(3) NOT NULL,
	"status" "EmployeeStatus" NOT NULL,
	"terminationDate" timestamp(3),
	"terminationReason" "ROEReasonCode",
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"addressCached" jsonb NOT NULL,
	"emailCached" text,
	"phoneCached" jsonb,
	"nameCached" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Employment" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"employeeId" text NOT NULL,
	"title" text,
	"department" text,
	"startDate" timestamp(3) NOT NULL,
	"endDate" timestamp(3),
	"countryCode" text DEFAULT 'CA' NOT NULL,
	"provinceCode" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "JobAssignment" (
	"id" text PRIMARY KEY NOT NULL,
	"employmentId" text NOT NULL,
	"departmentId" text,
	"costCenterId" text,
	"projectCode" text,
	"startDate" timestamp(3) NOT NULL,
	"endDate" timestamp(3),
	"payRate" numeric(10, 2) NOT NULL,
	"payType" "PayType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TimeEntry" (
	"id" text PRIMARY KEY NOT NULL,
	"jobAssignmentId" text NOT NULL,
	"workDate" timestamp(3) NOT NULL,
	"hours" numeric(6, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PayrollRun" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"periodStart" timestamp(3) NOT NULL,
	"periodEnd" timestamp(3) NOT NULL,
	"runDate" timestamp(3) NOT NULL,
	"status" "PayrollRunStatus" NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PayrollRunEmployee" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollRunId" text NOT NULL,
	"employeeId" text NOT NULL,
	"nameSnapshot" text NOT NULL,
	"addressSnapshot" text NOT NULL,
	"grossPay" numeric(10, 2) NOT NULL,
	"deductions" numeric(10, 2) NOT NULL,
	"netPay" numeric(10, 2) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PayrollLine" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollRunEmployeeId" text NOT NULL,
	"jobAssignmentId" text,
	"rate" numeric(10, 2) NOT NULL,
	"units" numeric(6, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"earningType" "EarningType" NOT NULL,
	"costCenterId" text,
	"departmentId" text
);
--> statement-breakpoint
CREATE TABLE "Deduction" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollRunEmployeeId" text NOT NULL,
	"type" "DeductionType" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PayrollDisbursement" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollRunEmployeeId" text NOT NULL,
	"institutionNumber" integer NOT NULL,
	"branchNumber" integer NOT NULL,
	"accountNumber" text NOT NULL,
	"bankLabel" text,
	"amount" numeric(10, 2) NOT NULL,
	"status" "DisbursementStatus" DEFAULT 'PENDING' NOT NULL,
	"referenceNumber" text,
	"processedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "PayrollJournal" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollRunId" text NOT NULL,
	"tenantId" text NOT NULL,
	"status" "JournalStatus" DEFAULT 'PENDING' NOT NULL,
	"postedAt" timestamp(3),
	"totalDebit" numeric(12, 2) NOT NULL,
	"totalCredit" numeric(12, 2) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "JournalEntry" (
	"id" text PRIMARY KEY NOT NULL,
	"payrollJournalId" text NOT NULL,
	"glAccountNumber" text,
	"glAccountName" text NOT NULL,
	"type" "EntryType" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "Remittance" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"periodYear" integer NOT NULL,
	"periodMonth" integer NOT NULL,
	"totalGrossPayroll" numeric(12, 2) NOT NULL,
	"totalEmployees" integer NOT NULL,
	"totalDue" numeric(12, 2) NOT NULL,
	"status" "RemittanceStatus" DEFAULT 'PENDING' NOT NULL,
	"paymentReference" text,
	"filedAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tenant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"legalName" text NOT NULL,
	"businessNumber" text,
	"industry" text,
	"baseCurrency" text DEFAULT 'CAD' NOT NULL,
	"standardWorkDayHours" numeric(4, 2) DEFAULT '8.0' NOT NULL,
	"standardWorkWeekHours" numeric(4, 2) DEFAULT '40.0' NOT NULL,
	"remittanceFrequency" "PayFrequency" DEFAULT 'MONTHLY' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TenantSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"enableGarnishments" boolean DEFAULT true NOT NULL,
	"autoApproveTime" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'America/Toronto' NOT NULL,
	"dateFormat" text DEFAULT 'YYYY-MM-DD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PayrollCycle" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"name" text NOT NULL,
	"frequency" "PayFrequency" NOT NULL,
	"firstPeriodStart" timestamp(3) NOT NULL,
	"firstPayDate" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Department" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"name" text NOT NULL,
	"code" text
);
--> statement-breakpoint
CREATE TABLE "ChartOfAccount" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "AccountType" NOT NULL,
	"category" "AccountCategory" NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GLMapping" (
	"id" text PRIMARY KEY NOT NULL,
	"tenantId" text NOT NULL,
	"chartOfAccountId" text NOT NULL,
	"mappingType" "MappingType" NOT NULL,
	"earningType" "EarningType",
	"deductionType" "DeductionType",
	"departmentId" text
);
--> statement-breakpoint
CREATE TABLE "RemittanceToPayrollRun" (
	"remittanceId" text NOT NULL,
	"payrollRunId" text NOT NULL,
	CONSTRAINT "RemittanceToPayrollRun_pkey" PRIMARY KEY("remittanceId","payrollRunId")
);
--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "LegalNameHistory" ADD CONSTRAINT "LegalNameHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ConversationalNameHistory" ADD CONSTRAINT "ConversationalNameHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_employmentId_fkey" FOREIGN KEY ("employmentId") REFERENCES "public"."Employment"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_jobAssignmentId_fkey" FOREIGN KEY ("jobAssignmentId") REFERENCES "public"."JobAssignment"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "public"."PayrollRun"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollLine" ADD CONSTRAINT "PayrollLine_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "public"."PayrollRunEmployee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollLine" ADD CONSTRAINT "PayrollLine_jobAssignmentId_fkey" FOREIGN KEY ("jobAssignmentId") REFERENCES "public"."JobAssignment"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "public"."PayrollRunEmployee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollDisbursement" ADD CONSTRAINT "PayrollDisbursement_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "public"."PayrollRunEmployee"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_payrollJournalId_fkey" FOREIGN KEY ("payrollJournalId") REFERENCES "public"."PayrollJournal"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PayrollCycle" ADD CONSTRAINT "PayrollCycle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GLMapping" ADD CONSTRAINT "GLMapping_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "public"."ChartOfAccount"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RemittanceToPayrollRun" ADD CONSTRAINT "RemittanceToPayrollRun_remittanceId_fkey" FOREIGN KEY ("remittanceId") REFERENCES "public"."Remittance"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Address_contactId_addressHash_key" ON "Address" USING btree ("contactId" text_ops,"addressHash" text_ops);--> statement-breakpoint
CREATE INDEX "Address_contactId_idx" ON "Address" USING btree ("contactId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Email_contactId_address_key" ON "Email" USING btree ("contactId" text_ops,"address" text_ops);--> statement-breakpoint
CREATE INDEX "Email_contactId_idx" ON "Email" USING btree ("contactId" text_ops);--> statement-breakpoint
CREATE INDEX "BankAccount_employeeId_idx" ON "BankAccount" USING btree ("employeeId" text_ops);--> statement-breakpoint
CREATE INDEX "Phone_contactId_idx" ON "Phone" USING btree ("contactId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Phone_contactId_number_key" ON "Phone" USING btree ("contactId" text_ops,"number" text_ops);--> statement-breakpoint
CREATE INDEX "StatHoliday_tenantId_date_idx" ON "StatHoliday" USING btree ("tenantId" text_ops,"date" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "StatHoliday_tenantId_date_provinceCode_key" ON "StatHoliday" USING btree ("tenantId" text_ops,"date" text_ops,"provinceCode" text_ops);--> statement-breakpoint
CREATE INDEX "PaySlip_employeeId_createdAt_idx" ON "PaySlip" USING btree ("employeeId" text_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "PaySlip_employeeId_idx" ON "PaySlip" USING btree ("employeeId" text_ops);--> statement-breakpoint
CREATE INDEX "PaySlip_tenantId_createdAt_idx" ON "PaySlip" USING btree ("tenantId" timestamp_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "PaySlip_tenantId_idx" ON "PaySlip" USING btree ("tenantId" text_ops);--> statement-breakpoint
CREATE INDEX "LegalNameHistory_contactId_effectiveFrom_idx" ON "LegalNameHistory" USING btree ("contactId" text_ops,"effectiveFrom" text_ops);--> statement-breakpoint
CREATE INDEX "ConversationalNameHistory_contactId_effectiveFrom_idx" ON "ConversationalNameHistory" USING btree ("contactId" text_ops,"effectiveFrom" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Employee_tenantId_contactId_key" ON "Employee" USING btree ("tenantId" text_ops,"contactId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Employee_tenantId_employeeNumber_key" ON "Employee" USING btree ("tenantId" text_ops,"employeeNumber" text_ops);--> statement-breakpoint
CREATE INDEX "Employment_employeeId_startDate_idx" ON "Employment" USING btree ("employeeId" text_ops,"startDate" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Employment_tenantId_employeeId_startDate_idx" ON "Employment" USING btree ("tenantId" timestamp_ops,"employeeId" timestamp_ops,"startDate" text_ops);--> statement-breakpoint
CREATE INDEX "JobAssignment_employmentId_startDate_idx" ON "JobAssignment" USING btree ("employmentId" text_ops,"startDate" text_ops);--> statement-breakpoint
CREATE INDEX "TimeEntry_jobAssignmentId_workDate_idx" ON "TimeEntry" USING btree ("jobAssignmentId" text_ops,"workDate" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PayrollRun_tenantId_periodStart_periodEnd_key" ON "PayrollRun" USING btree ("tenantId" text_ops,"periodStart" text_ops,"periodEnd" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PayrollRunEmployee_payrollRunId_employeeId_key" ON "PayrollRunEmployee" USING btree ("payrollRunId" text_ops,"employeeId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Deduction_payrollRunEmployeeId_type_key" ON "Deduction" USING btree ("payrollRunEmployeeId" text_ops,"type" text_ops);--> statement-breakpoint
CREATE INDEX "PayrollDisbursement_payrollRunEmployeeId_idx" ON "PayrollDisbursement" USING btree ("payrollRunEmployeeId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "PayrollJournal_payrollRunId_key" ON "PayrollJournal" USING btree ("payrollRunId" text_ops);--> statement-breakpoint
CREATE INDEX "PayrollJournal_tenantId_idx" ON "PayrollJournal" USING btree ("tenantId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Remittance_tenantId_periodYear_periodMonth_key" ON "Remittance" USING btree ("tenantId" int4_ops,"periodYear" int4_ops,"periodMonth" int4_ops);--> statement-breakpoint
CREATE INDEX "Remittance_tenantId_status_idx" ON "Remittance" USING btree ("tenantId" enum_ops,"status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings" USING btree ("tenantId" text_ops);--> statement-breakpoint
CREATE INDEX "PayrollCycle_tenantId_idx" ON "PayrollCycle" USING btree ("tenantId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Department_tenantId_code_key" ON "Department" USING btree ("tenantId" text_ops,"code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ChartOfAccount_tenantId_code_key" ON "ChartOfAccount" USING btree ("tenantId" text_ops,"code" text_ops);--> statement-breakpoint
CREATE INDEX "ChartOfAccount_tenantId_idx" ON "ChartOfAccount" USING btree ("tenantId" text_ops);--> statement-breakpoint
CREATE INDEX "GLMapping_tenantId_mappingType_idx" ON "GLMapping" USING btree ("tenantId" text_ops,"mappingType" text_ops);
*/