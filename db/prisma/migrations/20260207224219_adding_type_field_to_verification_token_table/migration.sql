-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "verification_token" ADD COLUMN     "type" "token_type" NOT NULL DEFAULT 'EMAIL_VERIFICATION';
