/*
  Warnings:

  - You are about to drop the column `pending_email` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth_token" RENAME CONSTRAINT "email_verification_pkey" TO "auth_token_pkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "pending_email",
ADD COLUMN     "candidate_email" TEXT,
ADD COLUMN     "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN     "terms_version_accepted" TEXT;

-- RenameForeignKey
ALTER TABLE "auth_token" RENAME CONSTRAINT "email_verification_user_id_fkey" TO "auth_token_user_id_fkey";

-- RenameIndex
ALTER INDEX "email_verification_token_key" RENAME TO "auth_token_token_key";

-- RenameIndex
ALTER INDEX "email_verification_user_id_type_idx" RENAME TO "auth_token_user_id_type_idx";
