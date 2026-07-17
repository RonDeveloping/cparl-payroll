/*
  Warnings:

  - You are about to drop the column `is_kind_benefit` on the `earning_codes` table. All the data in the column will be lost.
  - You are about to drop the column `pay_type` on the `job_assignment` table. All the data in the column will be lost.
  - Added the required column `earning_code_id` to the `job_assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "earning_type" ADD VALUE 'sick';
ALTER TYPE "earning_type" ADD VALUE 'taxable_benefit';
ALTER TYPE "earning_type" ADD VALUE 'reasonable_allowance';

-- AlterTable
ALTER TABLE "earning_codes" DROP COLUMN "is_kind_benefit",
ADD COLUMN     "is_hourly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_in_kind" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "job_assignment" DROP COLUMN "pay_type",
ADD COLUMN     "earning_code_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "pay_type";

-- CreateIndex
CREATE INDEX "job_assignment_earning_code_id_idx" ON "job_assignment"("earning_code_id");

-- AddForeignKey
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_earning_code_id_fkey" FOREIGN KEY ("earning_code_id") REFERENCES "earning_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
