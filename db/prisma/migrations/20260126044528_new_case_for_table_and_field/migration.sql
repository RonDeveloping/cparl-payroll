/*
  Warnings:

  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChartOfAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConversationalNameHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deduction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Email` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GLMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LegalNameHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaySlip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollCycle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollDisbursement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollJournal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRunEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Remittance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RemittanceToPayrollRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatHoliday` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "conversational_name_source" AS ENUM ('user', 'support', 'import', 'system');

-- CreateEnum
CREATE TYPE "phone_type" AS ENUM ('mobile', 'home', 'work');

-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('active', 'terminated', 'on_leave');

-- CreateEnum
CREATE TYPE "pay_type" AS ENUM ('hourly', 'salary');

-- CreateEnum
CREATE TYPE "earning_type" AS ENUM ('regular', 'overtime', 'bonus', 'commission', 'other');

-- CreateEnum
CREATE TYPE "payroll_run_status" AS ENUM ('draft', 'finalized', 'paid');

-- CreateEnum
CREATE TYPE "deduction_type" AS ENUM ('tax', 'cpp', 'ei', 'benefit', 'other');

-- CreateEnum
CREATE TYPE "distribution_type" AS ENUM ('fixed_amount', 'percentage', 'remainder');

-- CreateEnum
CREATE TYPE "disbursement_status" AS ENUM ('pending', 'sent', 'failed', 'reconciled');

-- CreateEnum
CREATE TYPE "pay_frequency" AS ENUM ('weekly', 'biweekly', 'semimonthly', 'monthly');

-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- CreateEnum
CREATE TYPE "account_category" AS ENUM ('cash', 'payroll_expense', 'tax_payable', 'benefit_payable', 'wages_payable', 'other');

-- CreateEnum
CREATE TYPE "mapping_type" AS ENUM ('earning', 'deduction', 'employer_tax', 'net_pay_clearing');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_contactId_fkey";

-- DropForeignKey
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationalNameHistory" DROP CONSTRAINT "ConversationalNameHistory_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Deduction" DROP CONSTRAINT "Deduction_payrollRunEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Employment" DROP CONSTRAINT "Employment_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "GLMapping" DROP CONSTRAINT "GLMapping_chartOfAccountId_fkey";

-- DropForeignKey
ALTER TABLE "JobAssignment" DROP CONSTRAINT "JobAssignment_employmentId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_payrollJournalId_fkey";

-- DropForeignKey
ALTER TABLE "LegalNameHistory" DROP CONSTRAINT "LegalNameHistory_contactId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollCycle" DROP CONSTRAINT "PayrollCycle_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollDisbursement" DROP CONSTRAINT "PayrollDisbursement_payrollRunEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollLine" DROP CONSTRAINT "PayrollLine_jobAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollLine" DROP CONSTRAINT "PayrollLine_payrollRunEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRunEmployee" DROP CONSTRAINT "PayrollRunEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRunEmployee" DROP CONSTRAINT "PayrollRunEmployee_payrollRunId_fkey";

-- DropForeignKey
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_contactId_fkey";

-- DropForeignKey
ALTER TABLE "RemittanceToPayrollRun" DROP CONSTRAINT "RemittanceToPayrollRun_remittanceId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_jobAssignmentId_fkey";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "BankAccount";

-- DropTable
DROP TABLE "ChartOfAccount";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "ConversationalNameHistory";

-- DropTable
DROP TABLE "Deduction";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Email";

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "Employment";

-- DropTable
DROP TABLE "GLMapping";

-- DropTable
DROP TABLE "JobAssignment";

-- DropTable
DROP TABLE "JournalEntry";

-- DropTable
DROP TABLE "LegalNameHistory";

-- DropTable
DROP TABLE "PaySlip";

-- DropTable
DROP TABLE "PayrollCycle";

-- DropTable
DROP TABLE "PayrollDisbursement";

-- DropTable
DROP TABLE "PayrollJournal";

-- DropTable
DROP TABLE "PayrollLine";

-- DropTable
DROP TABLE "PayrollRun";

-- DropTable
DROP TABLE "PayrollRunEmployee";

-- DropTable
DROP TABLE "Phone";

-- DropTable
DROP TABLE "Remittance";

-- DropTable
DROP TABLE "RemittanceToPayrollRun";

-- DropTable
DROP TABLE "StatHoliday";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "TenantSettings";

-- DropTable
DROP TABLE "TimeEntry";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "AccountCategory";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "ConversationalNameSource";

-- DropEnum
DROP TYPE "DeductionType";

-- DropEnum
DROP TYPE "DisbursementStatus";

-- DropEnum
DROP TYPE "DistributionType";

-- DropEnum
DROP TYPE "EarningType";

-- DropEnum
DROP TYPE "EmployeeStatus";

-- DropEnum
DROP TYPE "EntryType";

-- DropEnum
DROP TYPE "JournalStatus";

-- DropEnum
DROP TYPE "MappingType";

-- DropEnum
DROP TYPE "PayFrequency";

-- DropEnum
DROP TYPE "PayType";

-- DropEnum
DROP TYPE "PayrollRunStatus";

-- DropEnum
DROP TYPE "PhoneType";

-- DropEnum
DROP TYPE "ROEReasonCode";

-- DropEnum
DROP TYPE "RemittanceStatus";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "security_email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "pending_security_email" TEXT,
    "password_hash" TEXT,
    "contact_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "suffix" TEXT,
    "prefix" TEXT,
    "nick_name" TEXT,
    "display_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_name_history" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "changed_by" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversational_name_history" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "suffix" TEXT,
    "prefix" TEXT,
    "nick_name" TEXT,
    "display_name" TEXT,
    "source" "conversational_name_source",
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversational_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address_hash" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_address" TEXT NOT NULL,

    CONSTRAINT "email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "phone_type" DEFAULT 'mobile',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "employee_number" TEXT,
    "tax_id_encrypted" BYTEA NOT NULL,
    "tax_id_last_4" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "status" "employee_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address_cached" JSONB NOT NULL,
    "email_cached" TEXT,
    "phone_cached" JSONB,
    "name_cached" JSONB NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "country_code" TEXT NOT NULL DEFAULT 'CA',
    "province_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_assignment" (
    "id" TEXT NOT NULL,
    "employment_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "pay_rate" DECIMAL(10,2) NOT NULL,
    "pay_type" "pay_type" NOT NULL,

    CONSTRAINT "job_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entry" (
    "id" TEXT NOT NULL,
    "job_assignment_id" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "time_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "run_date" TIMESTAMP(3) NOT NULL,
    "status" "payroll_run_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run_employee" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "address_snapshot" TEXT NOT NULL,
    "gross_pay" DECIMAL(10,2) NOT NULL,
    "deductions" DECIMAL(10,2) NOT NULL,
    "net_pay" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_run_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_line" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "job_assignment_id" TEXT,
    "rate" DECIMAL(10,2) NOT NULL,
    "units" DECIMAL(6,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "earning_type" "earning_type" NOT NULL,

    CONSTRAINT "payroll_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deduction" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "type" "deduction_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "type" "distribution_type" NOT NULL DEFAULT 'remainder',
    "value" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_disbursement" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "disbursement_status" NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payroll_disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "business_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cycle" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "pay_frequency" NOT NULL,

    CONSTRAINT "payroll_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_account" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "account_type" NOT NULL,
    "category" "account_category" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gl_mapping" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "chart_of_account_id" TEXT NOT NULL,
    "mapping_type" "mapping_type" NOT NULL,
    "earning_type" "earning_type",
    "deduction_type" "deduction_type",
    "department_id" TEXT,

    CONSTRAINT "gl_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_security_email_key" ON "user"("security_email");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_id_key" ON "user"("contact_id");

-- CreateIndex
CREATE INDEX "legal_name_history_contact_id_effective_from_idx" ON "legal_name_history"("contact_id", "effective_from");

-- CreateIndex
CREATE INDEX "conversational_name_history_contact_id_effective_from_idx" ON "conversational_name_history"("contact_id", "effective_from");

-- CreateIndex
CREATE INDEX "address_contact_id_idx" ON "address"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_contact_id_address_hash_key" ON "address"("contact_id", "address_hash");

-- CreateIndex
CREATE INDEX "email_contact_id_idx" ON "email"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_contact_id_email_address_key" ON "email"("contact_id", "email_address");

-- CreateIndex
CREATE INDEX "phone_contact_id_idx" ON "phone"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "phone_contact_id_number_key" ON "phone"("contact_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "employee_tenant_id_contact_id_key" ON "employee"("tenant_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_tenant_id_employee_number_key" ON "employee"("tenant_id", "employee_number");

-- CreateIndex
CREATE INDEX "employment_tenant_id_employee_id_start_date_idx" ON "employment"("tenant_id", "employee_id", "start_date");

-- CreateIndex
CREATE INDEX "employment_employee_id_start_date_idx" ON "employment"("employee_id", "start_date");

-- CreateIndex
CREATE INDEX "job_assignment_employment_id_start_date_idx" ON "job_assignment"("employment_id", "start_date");

-- CreateIndex
CREATE INDEX "time_entry_job_assignment_id_work_date_idx" ON "time_entry"("job_assignment_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_tenant_id_period_start_period_end_key" ON "payroll_run"("tenant_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_employee_payroll_run_id_employee_id_key" ON "payroll_run_employee"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "deduction_payroll_run_employee_id_type_key" ON "deduction"("payroll_run_employee_id", "type");

-- CreateIndex
CREATE INDEX "bank_account_employee_id_idx" ON "bank_account"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_disbursement_payroll_run_employee_id_idx" ON "payroll_disbursement"("payroll_run_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "payroll_cycle_tenant_id_idx" ON "payroll_cycle"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_tenant_id_code_key" ON "department"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "chart_of_account_tenant_id_idx" ON "chart_of_account"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_account_tenant_id_code_key" ON "chart_of_account"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gl_mapping_tenant_id_mapping_type_idx" ON "gl_mapping"("tenant_id", "mapping_type");

-- AddForeignKey
ALTER TABLE "legal_name_history" ADD CONSTRAINT "legal_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversational_name_history" ADD CONSTRAINT "conversational_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment" ADD CONSTRAINT "employment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_job_assignment_id_fkey" FOREIGN KEY ("job_assignment_id") REFERENCES "job_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employee" ADD CONSTRAINT "payroll_run_employee_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employee" ADD CONSTRAINT "payroll_run_employee_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line" ADD CONSTRAINT "payroll_line_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line" ADD CONSTRAINT "payroll_line_job_assignment_id_fkey" FOREIGN KEY ("job_assignment_id") REFERENCES "job_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deduction" ADD CONSTRAINT "deduction_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_disbursement" ADD CONSTRAINT "payroll_disbursement_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cycle" ADD CONSTRAINT "payroll_cycle_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_mapping" ADD CONSTRAINT "gl_mapping_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
