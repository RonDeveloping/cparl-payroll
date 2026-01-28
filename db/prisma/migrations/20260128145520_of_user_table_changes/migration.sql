/*
  Warnings:

  - You are about to drop the column `display_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `pending_security_email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `security_email` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `given_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_security_email_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "display_name",
DROP COLUMN "pending_security_email",
DROP COLUMN "security_email",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "family_name" TEXT NOT NULL,
ADD COLUMN     "given_name" TEXT NOT NULL,
ADD COLUMN     "pending_email" TEXT,
ADD COLUMN     "pending_phone" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "phone_verified_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
