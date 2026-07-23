/*
  Warnings:

  - The values [taxable_benefit,reasonable_allowance] on the enum `earning_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "contributory_tax_at_source" AS ENUM ('post_tax', 'pre_tax', 'tax_credit');

-- AlterEnum
BEGIN;
CREATE TYPE "earning_type_new" AS ENUM ('regular', 'overtime', 'sick', 'holiday', 'vacation', 'bonus', 'commission', 'in_kind', 'per_diem', 'other');
ALTER TABLE "gl_mapping" ALTER COLUMN "earning_type" TYPE "earning_type_new" USING ("earning_type"::text::"earning_type_new");
ALTER TABLE "payroll_line" ALTER COLUMN "earning_type" TYPE "earning_type_new" USING ("earning_type"::text::"earning_type_new");
ALTER TABLE "earning_codes" ALTER COLUMN "earning_type" TYPE "earning_type_new" USING ("earning_type"::text::"earning_type_new");
ALTER TYPE "earning_type" RENAME TO "earning_type_old";
ALTER TYPE "earning_type_new" RENAME TO "earning_type";
DROP TYPE "public"."earning_type_old";
COMMIT;

-- AlterTable
ALTER TABLE "contributory_codes" ADD COLUMN     "employee_deduction_at_source" "contributory_tax_at_source" NOT NULL DEFAULT 'post_tax';
