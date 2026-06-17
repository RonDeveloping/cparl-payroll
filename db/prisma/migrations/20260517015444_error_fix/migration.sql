-- CreateEnum
CREATE TYPE "bank_account_verification_status" AS ENUM ('unverified', 'pending', 'verified', 'failed');

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "verification_status" "bank_account_verification_status" NOT NULL DEFAULT 'unverified';
