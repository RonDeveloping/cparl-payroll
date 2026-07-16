/*
  Warnings:

  - The values [on_leave] on the enum `EmployeeStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [annually] on the enum `pay_frequency` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `threshold_hours` on the `overtime_config` table. All the data in the column will be lost.
  - You are about to drop the column `pay_schedule_id` on the `payroll_unit` table. All the data in the column will be lost.
  - You are about to drop the `overtime_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payroll_cycle` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenant_id,payroll_unit_id,period_start,period_end]` on the table `payroll_run` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `thresholdHours` to the `overtime_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payroll_unit_id` to the `pay_schedule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `severance_type` on the `severance_record` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemClass" AS ENUM ('GROSS_PAY', 'TAXABLE_ALLOWANCES', 'KIND_BENEFITS', 'TAXES_PAYABLE', 'EMPLOYER_CPP', 'EMPLOYER_EI', 'CPP_PAYABLE', 'EI_PAYABLE', 'BENEFITS_PAYABLE', 'REASONABLE_ALLOWANCES', 'PAYROLL_CLEARING');

-- CreateEnum
CREATE TYPE "tax_calculation_method" AS ENUM ('regular', 'bonus', 'flat', 'exempt');

-- AlterEnum
BEGIN;
CREATE TYPE "EmployeeStatus_new" AS ENUM ('active', 'terminated', 'inactive');
ALTER TABLE "public"."employee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "employee" ALTER COLUMN "status" TYPE "EmployeeStatus_new" USING ("status"::text::"EmployeeStatus_new");
ALTER TYPE "EmployeeStatus" RENAME TO "EmployeeStatus_old";
ALTER TYPE "EmployeeStatus_new" RENAME TO "EmployeeStatus";
DROP TYPE "public"."EmployeeStatus_old";
ALTER TABLE "employee" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- DropTable
DROP TABLE IF EXISTS "payroll_cycle";

-- AlterEnum
BEGIN;
CREATE TYPE "pay_frequency_new" AS ENUM ('monthly', 'semimonthly', 'biweekly', 'weekly');
ALTER TABLE "pay_schedule" ALTER COLUMN "frequency" TYPE "pay_frequency_new" USING ("frequency"::text::"pay_frequency_new");
ALTER TYPE "pay_frequency" RENAME TO "pay_frequency_old";
ALTER TYPE "pay_frequency_new" RENAME TO "pay_frequency";
DROP TYPE "public"."pay_frequency_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "overtime_details" DROP CONSTRAINT "overtime_details_config_id_fkey";

-- DropForeignKey
ALTER TABLE "overtime_details" DROP CONSTRAINT "overtime_details_payroll_line_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_unit" DROP CONSTRAINT "payroll_unit_pay_schedule_id_fkey";

-- DropIndex
DROP INDEX "payroll_run_tenant_id_period_start_period_end_key";

-- DropIndex
DROP INDEX "payroll_unit_pay_schedule_id_idx";

-- AlterTable
ALTER TABLE "overtime_config" DROP COLUMN "threshold_hours",
ADD COLUMN     "thresholdHours" DECIMAL(6,2) NOT NULL;

-- AlterTable
ALTER TABLE "pay_schedule" ADD COLUMN     "payroll_unit_id" TEXT;

-- Backfill pay_schedule.payroll_unit_id from existing payroll_unit.pay_schedule_id
UPDATE "pay_schedule" AS ps
SET "payroll_unit_id" = pu."id"
FROM "payroll_unit" AS pu
WHERE pu."pay_schedule_id" = ps."id"
    AND ps."payroll_unit_id" IS NULL;

-- AlterTable
ALTER TABLE "payroll_run" ADD COLUMN     "payroll_unit_id" TEXT;

-- AlterTable
ALTER TABLE "payroll_unit" DROP COLUMN "pay_schedule_id";

-- Enforce required pay_schedule.payroll_unit_id after backfill
ALTER TABLE "pay_schedule" ALTER COLUMN "payroll_unit_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "severance_record" DROP COLUMN "severance_type",
ADD COLUMN     "severance_type" TEXT NOT NULL;

-- DropTable
DROP TABLE "overtime_details";

-- CreateTable
CREATE TABLE "payroll_unit_employee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payroll_unit_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_unit_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_gl_matrix" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_class" "ItemClass" NOT NULL,
    "gl_account_id" TEXT NOT NULL,
    "gl_account_name" TEXT NOT NULL,
    "is_debit" BOOLEAN NOT NULL DEFAULT true,
    "payroll_unit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_gl_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeDetails" (
    "id" TEXT NOT NULL,
    "payroll_line_id" TEXT NOT NULL,
    "overtimeRate" DECIMAL(10,2) NOT NULL,
    "config_id" TEXT NOT NULL,
    "period_type" "overtime_period_type" NOT NULL DEFAULT 'weekly',
    "work_date" TIMESTAMP(3),
    "regularRate" DECIMAL(10,2) NOT NULL,
    "overtimeHours" DECIMAL(6,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OvertimeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpp_ei_rates" (
    "id" TEXT NOT NULL,
    "tax_year" INTEGER NOT NULL,
    "province_code" CHAR(2) NOT NULL,
    "cpp_base_rate" DECIMAL(5,4) NOT NULL,
    "cpp_enhanced_rate" DECIMAL(5,4) NOT NULL,
    "cpp_exemption" DECIMAL(5,4) NOT NULL,
    "cpp_ympe" DECIMAL(10,2) NOT NULL,
    "cpp2_rate" DECIMAL(5,4) NOT NULL,
    "cpp2_ympe" DECIMAL(10,2) NOT NULL,
    "ei_rate" DECIMAL(5,4) NOT NULL,
    "ei_max_earnings" DECIMAL(10,2) NOT NULL,
    "ei_multiplier" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpp_ei_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "tax_year" INTEGER NOT NULL,
    "province_code" CHAR(2) NOT NULL,
    "federal_rate" DECIMAL(5,4) NOT NULL,
    "lower_bound" DECIMAL(10,2) NOT NULL,
    "upper_bound" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earning_codes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earning_type" "earning_type" NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_kind_benefit" BOOLEAN NOT NULL DEFAULT false,
    "is_subject_to_cpp" BOOLEAN NOT NULL DEFAULT true,
    "is_subject_to_ei" BOOLEAN NOT NULL DEFAULT true,
    "t4_box_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earning_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payroll_unit_employee_tenant_id_employee_id_start_date_idx" ON "payroll_unit_employee"("tenant_id", "employee_id", "start_date");

-- CreateIndex
CREATE INDEX "payroll_unit_employee_payroll_unit_id_start_date_idx" ON "payroll_unit_employee"("payroll_unit_id", "start_date");

-- CreateIndex
CREATE INDEX "payroll_gl_matrix_tenant_id_payroll_unit_id_idx" ON "payroll_gl_matrix"("tenant_id", "payroll_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeDetails_payroll_line_id_key" ON "OvertimeDetails"("payroll_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "cpp_ei_rates_tax_year_province_code_key" ON "cpp_ei_rates"("tax_year", "province_code");

-- CreateIndex
CREATE INDEX "tax_rates_tax_year_province_code_idx" ON "tax_rates"("tax_year", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_tax_year_province_code_key" ON "tax_rates"("tax_year", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "earning_codes_code_tenant_id_key" ON "earning_codes"("code", "tenant_id");

-- CreateIndex
CREATE INDEX "pay_schedule_payroll_unit_id_idx" ON "pay_schedule"("payroll_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_tenant_id_payroll_unit_id_period_start_period_e_key" ON "payroll_run"("tenant_id", "payroll_unit_id", "period_start", "period_end");

-- AddForeignKey
ALTER TABLE "pay_schedule" ADD CONSTRAINT "pay_schedule_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_unit_employee" ADD CONSTRAINT "payroll_unit_employee_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_unit_employee" ADD CONSTRAINT "payroll_unit_employee_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_gl_matrix" ADD CONSTRAINT "payroll_gl_matrix_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run" ADD CONSTRAINT "payroll_run_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeDetails" ADD CONSTRAINT "OvertimeDetails_payroll_line_id_fkey" FOREIGN KEY ("payroll_line_id") REFERENCES "payroll_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeDetails" ADD CONSTRAINT "OvertimeDetails_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "overtime_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "unique_holiday_policy_per_province" RENAME TO "holiday_policy_tenant_id_province_code_key";

-- RenameIndex
ALTER INDEX "unique_vacation_policy_per_employee" RENAME TO "vacation_policy_tenant_id_employee_id_key";
