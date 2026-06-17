-- Rename table to match the verificationEmailToken model name
ALTER TABLE "pending_email_verification" RENAME TO "verification_email_token";

-- Rename constraints and indexes to match the new table name
ALTER INDEX "pending_email_verification_pkey" RENAME TO "verification_email_token_pkey";
ALTER INDEX "pending_email_verification_token_key" RENAME TO "verification_email_token_token_key";
ALTER INDEX "pending_email_verification_email_idx" RENAME TO "verification_email_token_email_idx";
ALTER INDEX "pending_email_verification_token_idx" RENAME TO "verification_email_token_token_idx";
