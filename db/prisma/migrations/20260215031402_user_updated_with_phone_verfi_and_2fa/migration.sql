/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `email_verification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `phone_verification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `two_factor_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "phone_verification" DROP CONSTRAINT "phone_verification_user_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_user_id_key" ON "email_verification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "phone_verification_user_id_key" ON "phone_verification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_codes_user_id_key" ON "two_factor_codes"("user_id");

-- AddForeignKey
ALTER TABLE "phone_verification" ADD CONSTRAINT "phone_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
