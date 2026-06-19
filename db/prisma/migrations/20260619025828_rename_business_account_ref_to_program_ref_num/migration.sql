/*
  Warnings:

  - You are about to drop the column `business_account_ref` on the `tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tenant_business_bn9_business_program_id_business_account_re_idx";

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "business_account_ref",
ADD COLUMN     "program_ref_num" CHAR(4);

-- CreateIndex
CREATE INDEX "tenant_business_bn9_business_program_id_program_ref_num_idx" ON "tenant"("business_bn9", "business_program_id", "program_ref_num");
