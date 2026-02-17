-- DropIndex
DROP INDEX "email_verification_user_id_idx";

-- DropIndex
DROP INDEX "email_verification_user_id_key";

-- CreateIndex
CREATE INDEX "email_verification_user_id_type_idx" ON "email_verification"("user_id", "type");
