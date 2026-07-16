-- AlterEnum
ALTER TYPE "earning_type" ADD VALUE IF NOT EXISTS 'holiday';
ALTER TYPE "earning_type" ADD VALUE IF NOT EXISTS 'vacation';

-- CreateEnum
CREATE TYPE "holiday_pay_method" AS ENUM ('statutory', 'fixed');

-- CreateEnum
CREATE TYPE "overtime_period_type" AS ENUM ('daily', 'weekly', 'holiday');

-- CreateEnum
CREATE TYPE "overtime_type" AS ENUM ('standard', 'double', 'custom');

-- CreateEnum
CREATE TYPE "vacation_balance_unit" AS ENUM ('amount', 'hours');

-- CreateEnum
CREATE TYPE "vacation_ledger_entry_type" AS ENUM ('accrual', 'usage', 'payout', 'adjustment');

-- CreateEnum
CREATE TYPE "severance_type" AS ENUM ('retiring_direct', 'retiring_transfer', 'salary_continuation');

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "province_code" AS ENUM (
        'AB',
        'BC',
        'MB',
        'NB',
        'NL',
        'NS',
        'NT',
        'NU',
        'ON',
        'PE',
        'QC',
        'SK',
        'YT',
        'CA'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "payroll_line"
ADD COLUMN     "counts_toward_holiday_pay" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "counts_toward_vacation_accrual" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "overtime_config" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "province_code" "province_code",
    "description" TEXT NOT NULL,
    "overtime_type" "overtime_type" NOT NULL,
    "custom_multiplier" DECIMAL(4,2),
    "threshold_hours" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_details" (
    "id" TEXT NOT NULL,
    "payroll_line_id" TEXT NOT NULL,
    "overtime_rate" DECIMAL(10,2) NOT NULL,
    "config_id" TEXT NOT NULL,
    "period_type" "overtime_period_type" NOT NULL DEFAULT 'weekly',
    "work_date" TIMESTAMP(3),
    "regular_rate" DECIMAL(10,2) NOT NULL,
    "overtime_hours" DECIMAL(6,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "overtime_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_policy" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "vac_rate" DECIMAL(5,4) NOT NULL,
    "is_accrual_based" BOOLEAN NOT NULL DEFAULT true,
    "vac_balance" DECIMAL(10,2) NOT NULL,
    "balance_unit" "vacation_balance_unit" NOT NULL DEFAULT 'amount',
    "vac_hours_balance" DECIMAL(8,2),
    "accrual_hours_per_pay_period" DECIMAL(8,4),
    "accrual_start_date" TIMESTAMP(3),
    "payout_on_termination" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_policy_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_vacation_policy_per_employee" UNIQUE ("tenant_id", "employee_id")
);

-- CreateTable
CREATE TABLE "vacation_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "vac_policy_id" TEXT NOT NULL,
    "entry_type" "vacation_ledger_entry_type" NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(8,2),
    "amount" DECIMAL(10,2) NOT NULL,
    "payroll_run_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_policy" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "province_code" "province_code" NOT NULL,
    "method" "holiday_pay_method" NOT NULL,
    "average_window_weeks" INTEGER DEFAULT 4,
    "fixed_percent" DECIMAL(5,4),
    "minimum_employment_days" INTEGER,
    "include_vacation_pay" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_policy_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_holiday_policy_per_province" UNIQUE ("tenant_id", "province_code")
);

-- CreateTable
CREATE TABLE "holiday_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "holiday_policy_id" TEXT NOT NULL,
    "payroll_run_id" TEXT,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "base_earnings" DECIMAL(10,2) NOT NULL,
    "hours" DECIMAL(8,2),
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "severance_record" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "severance_type" "severance_type" NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "tax_withheld" DECIMAL(10,2) NOT NULL,
    "t4_box_code" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "severance_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "overtime_config_tenant_id_idx" ON "overtime_config"("tenant_id");

-- CreateIndex
CREATE INDEX "overtime_config_tenant_id_province_code_idx" ON "overtime_config"("tenant_id", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "overtime_details_payroll_line_id_key" ON "overtime_details"("payroll_line_id");

-- CreateIndex
CREATE INDEX "vacation_ledger_tenant_id_employee_id_effective_date_idx" ON "vacation_ledger"("tenant_id", "employee_id", "effective_date");

-- CreateIndex
CREATE INDEX "holiday_ledger_tenant_id_employee_id_holiday_date_idx" ON "holiday_ledger"("tenant_id", "employee_id", "holiday_date");

-- AddForeignKey
ALTER TABLE "overtime_config" ADD CONSTRAINT "overtime_config_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_details" ADD CONSTRAINT "overtime_details_payroll_line_id_fkey" FOREIGN KEY ("payroll_line_id") REFERENCES "payroll_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_details" ADD CONSTRAINT "overtime_details_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "overtime_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_policy" ADD CONSTRAINT "vacation_policy_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_vac_policy_id_fkey" FOREIGN KEY ("vac_policy_id") REFERENCES "vacation_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_policy" ADD CONSTRAINT "holiday_policy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_holiday_policy_id_fkey" FOREIGN KEY ("holiday_policy_id") REFERENCES "holiday_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "severance_record" ADD CONSTRAINT "severance_record_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "severance_record" ADD CONSTRAINT "severance_record_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
