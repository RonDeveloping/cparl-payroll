-- CreateEnum
CREATE TYPE "time_off_policy_type" AS ENUM ('vacation', 'sick', 'unpaid');

-- CreateTable
CREATE TABLE "employee_contributory_selection" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "contributory_code_id" TEXT NOT NULL,
    "deduction_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "participation_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_contributory_selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_time_off_benchmark_policy" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "policy_type" "time_off_policy_type" NOT NULL,
    "accrual_frequency" TEXT,
    "accrual_rate_percent" DECIMAL(8,4),
    "annual_allowance_hours" DECIMAL(8,2),
    "hour_cap_hours" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_time_off_benchmark_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_contributory_selection_tenant_id_employee_id_idx" ON "employee_contributory_selection"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_contributory_selection_tenant_id_contributory_code_idx" ON "employee_contributory_selection"("tenant_id", "contributory_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_contributory_selection_employee_id_contributory_co_key" ON "employee_contributory_selection"("employee_id", "contributory_code_id");

-- CreateIndex
CREATE INDEX "tenant_time_off_benchmark_policy_tenant_id_idx" ON "tenant_time_off_benchmark_policy"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_time_off_benchmark_policy_tenant_id_policy_type_key" ON "tenant_time_off_benchmark_policy"("tenant_id", "policy_type");

-- AddForeignKey
ALTER TABLE "employee_contributory_selection" ADD CONSTRAINT "employee_contributory_selection_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contributory_selection" ADD CONSTRAINT "employee_contributory_selection_contributory_code_id_fkey" FOREIGN KEY ("contributory_code_id") REFERENCES "contributory_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_time_off_benchmark_policy" ADD CONSTRAINT "tenant_time_off_benchmark_policy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
