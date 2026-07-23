-- CreateEnum
CREATE TYPE "contributory_category" AS ENUM ('health_insurance', 'retirement_plan', 'in_kind_benefit', 'pure_deduction');

-- CreateEnum
CREATE TYPE "contributory_method" AS ENUM ('flat_amount', 'percent_of_gross', 'per_hour_worked', 'none');

-- CreateTable
CREATE TABLE "contributory_codes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "contributory_category" NOT NULL,
    "description" TEXT NOT NULL,
    "employee_deduction_method" "contributory_method" NOT NULL,
    "employee_deduction_rate" DECIMAL(12,4) NOT NULL,
    "employee_exempt_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "employee_deduction_limit" DECIMAL(12,2),
    "employee_t4_box_number" INTEGER,
    "employer_participation_method" "contributory_method" NOT NULL DEFAULT 'none',
    "employer_participation_rate" DECIMAL(12,4),
    "employer_exempt_earnings" DECIMAL(12,2),
    "employer_participation_limit" DECIMAL(12,2),
    "earning_code_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributory_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contributory_codes_tenant_id_idx" ON "contributory_codes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributory_codes_code_tenant_id_key" ON "contributory_codes"("code", "tenant_id");

-- AddForeignKey
ALTER TABLE "contributory_codes" ADD CONSTRAINT "contributory_codes_earning_code_id_fkey" FOREIGN KEY ("earning_code_id") REFERENCES "earning_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributory_codes" ADD CONSTRAINT "contributory_codes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
