/*
  Warnings:

  - You are about to drop the column `family_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `bank_account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payroll_disbursement` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "remittance_status" AS ENUM ('pending', 'reviewed', 'filed', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "journal_status" AS ENUM ('pending', 'posted', 'failed', 'voided');

-- CreateEnum
CREATE TYPE "entry_type" AS ENUM ('debit', 'credit');

-- DropForeignKey
ALTER TABLE "bank_account" DROP CONSTRAINT "bank_account_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_disbursement" DROP CONSTRAINT "payroll_disbursement_payroll_run_employee_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "family_name",
DROP COLUMN "given_name",
ALTER COLUMN "phone" DROP NOT NULL;

-- DropTable
DROP TABLE "bank_account";

-- DropTable
DROP TABLE "payroll_disbursement";

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "type" "distribution_type" NOT NULL DEFAULT 'remainder',
    "value" DECIMAL(10,2),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_disbursements" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_label" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "disbursement_status" NOT NULL DEFAULT 'pending',
    "reference_number" TEXT,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payroll_disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_journals" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" "journal_status" NOT NULL DEFAULT 'pending',
    "posted_at" TIMESTAMP(3),
    "total_debit" DECIMAL(12,2) NOT NULL,
    "total_credit" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "payroll_journal_id" TEXT NOT NULL,
    "gl_account_number" TEXT,
    "gl_account_name" TEXT NOT NULL,
    "type" "entry_type" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_slips" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "s3_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "employee_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "pay_slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittances" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_year" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "total_gross_payroll" DECIMAL(12,2) NOT NULL,
    "total_employees" INTEGER NOT NULL,
    "total_due" DECIMAL(12,2) NOT NULL,
    "status" "remittance_status" NOT NULL DEFAULT 'pending',
    "payment_reference" TEXT,
    "filed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittance_to_payroll_runs" (
    "remittance_id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,

    CONSTRAINT "remittance_to_payroll_runs_pkey" PRIMARY KEY ("remittance_id","payroll_run_id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_employee_id_idx" ON "bank_accounts"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_disbursements_payroll_run_employee_id_idx" ON "payroll_disbursements"("payroll_run_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_journals_payroll_run_id_key" ON "payroll_journals"("payroll_run_id");

-- CreateIndex
CREATE INDEX "payroll_journals_tenant_id_idx" ON "payroll_journals"("tenant_id");

-- CreateIndex
CREATE INDEX "pay_slips_employee_id_idx" ON "pay_slips"("employee_id");

-- CreateIndex
CREATE INDEX "pay_slips_tenant_id_idx" ON "pay_slips"("tenant_id");

-- CreateIndex
CREATE INDEX "pay_slips_tenant_id_created_at_idx" ON "pay_slips"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "pay_slips_employee_id_created_at_idx" ON "pay_slips"("employee_id", "created_at");

-- CreateIndex
CREATE INDEX "remittances_tenant_id_status_idx" ON "remittances"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "remittances_tenant_id_period_year_period_month_key" ON "remittances"("tenant_id", "period_year", "period_month");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_disbursements" ADD CONSTRAINT "payroll_disbursements_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_payroll_journal_id_fkey" FOREIGN KEY ("payroll_journal_id") REFERENCES "payroll_journals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remittance_to_payroll_runs" ADD CONSTRAINT "remittance_to_payroll_runs_remittance_id_fkey" FOREIGN KEY ("remittance_id") REFERENCES "remittances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
