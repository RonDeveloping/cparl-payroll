-- Create missing pay schedule tables used by tenant upsert flow.
-- These were present in schema.prisma but absent from migration history.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'weekday'
    ) THEN
        CREATE TYPE "weekday" AS ENUM (
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "pay_schedule" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "pay_frequency" NOT NULL,
    "timing_days" INTEGER NOT NULL DEFAULT 2,
    "pay_day" INTEGER,
    "pay_weekday" "weekday",
    "boundary_shift" INTEGER NOT NULL,
    "period_end_day" INTEGER NOT NULL,
    "period_end_weekday" "weekday",
    "payday2" INTEGER,
    "period_end_day2" INTEGER,
    "boundary_shift2" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_schedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payroll_unit" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pay_schedule_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_unit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "pay_schedule_tenant_id_is_active_idx" ON "pay_schedule"("tenant_id", "is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "pay_schedule_tenant_id_code_key" ON "pay_schedule"("tenant_id", "code");

CREATE INDEX IF NOT EXISTS "payroll_unit_pay_schedule_id_idx" ON "payroll_unit"("pay_schedule_id");
CREATE INDEX IF NOT EXISTS "payroll_unit_tenant_id_is_active_idx" ON "payroll_unit"("tenant_id", "is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_unit_tenant_id_code_key" ON "payroll_unit"("tenant_id", "code");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pay_schedule_tenant_id_fkey'
    ) THEN
        ALTER TABLE "pay_schedule"
            ADD CONSTRAINT "pay_schedule_tenant_id_fkey"
            FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payroll_unit_tenant_id_fkey'
    ) THEN
        ALTER TABLE "payroll_unit"
            ADD CONSTRAINT "payroll_unit_tenant_id_fkey"
            FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payroll_unit_pay_schedule_id_fkey'
    ) THEN
        ALTER TABLE "payroll_unit"
            ADD CONSTRAINT "payroll_unit_pay_schedule_id_fkey"
            FOREIGN KEY ("pay_schedule_id") REFERENCES "pay_schedule"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
