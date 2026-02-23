/*
  Warnings:

  - The values [EMAIL_VERIFICATION,PASSWORD_RESET,EMAIL_CHANGE] on the enum `token_type` will be removed. If these variants are still used in the database, this will fail.
  - The `type` column on the `bank_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `family_name` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `nick_name` on the `contact` table. All the data in the column will be lost.
  - You are about to drop the column `nick_name` on the `conversational_name_history` table. All the data in the column will be lost.
  - The `status` column on the `employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `family_name` on the `legal_name_history` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `legal_name_history` table. All the data in the column will be lost.
  - You are about to drop the column `legal_name` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tenant` table. All the data in the column will be lost.
  - The `role` column on the `tenant_user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `core_name` to the `contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind_name` to the `contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `core_name` to the `legal_name_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind_name` to the `legal_name_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_id` to the `tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_cached` to the `tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'manager', 'accountant', 'employee');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'terminated', 'on_leave');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('fixed_amount', 'percentage', 'remainder');

-- CreateEnum
CREATE TYPE "subject" AS ENUM ('organization', 'individual');

-- AlterEnum
ALTER TYPE "pay_frequency" ADD VALUE 'annually';

-- AlterEnum
BEGIN;
CREATE TYPE "token_type_new" AS ENUM ('email_verification', 'password_reset', 'email_change');
ALTER TABLE "public"."email_verification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "email_verification" ALTER COLUMN "type" TYPE "token_type_new" USING ("type"::text::"token_type_new");
ALTER TYPE "token_type" RENAME TO "token_type_old";
ALTER TYPE "token_type_new" RENAME TO "token_type";
DROP TYPE "public"."token_type_old";
ALTER TABLE "email_verification" ALTER COLUMN "type" SET DEFAULT 'email_verification';
COMMIT;

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "type",
ADD COLUMN     "type" "DistributionType" NOT NULL DEFAULT 'remainder';

-- AlterTable
ALTER TABLE "contact" DROP COLUMN "family_name",
DROP COLUMN "given_name",
DROP COLUMN "nick_name",
ADD COLUMN     "alias_name" TEXT,
ADD COLUMN     "core_name" TEXT NOT NULL,
ADD COLUMN     "kind_name" TEXT NOT NULL,
ADD COLUMN     "source" "conversational_name_source",
ADD COLUMN     "subject" "subject" NOT NULL;

-- AlterTable
ALTER TABLE "conversational_name_history" DROP COLUMN "nick_name",
ADD COLUMN     "alias_name" TEXT;

-- AlterTable
ALTER TABLE "email_verification" ALTER COLUMN "type" SET DEFAULT 'email_verification';

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "status",
ADD COLUMN     "status" "EmployeeStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "legal_name_history" DROP COLUMN "family_name",
DROP COLUMN "given_name",
ADD COLUMN     "core_name" TEXT NOT NULL,
ADD COLUMN     "kind_name" TEXT NOT NULL,
ADD COLUMN     "source" "conversational_name_source";

-- AlterTable
ALTER TABLE "payroll_run" ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "legal_name",
DROP COLUMN "name",
ADD COLUMN     "contact_id" TEXT NOT NULL,
ADD COLUMN     "name_cached" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "tenant_user" DROP COLUMN "role",
ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'employee';

-- DropEnum
DROP TYPE "distribution_type";

-- DropEnum
DROP TYPE "employee_status";
