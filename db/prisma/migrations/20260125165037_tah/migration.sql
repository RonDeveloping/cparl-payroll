/*
  Warnings:

  - You are about to drop the column `address` on the `Email` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactId,emailAddress]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailAddress` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Email_contactId_address_key";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "address",
ADD COLUMN     "emailAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Email_contactId_emailAddress_key" ON "Email"("contactId", "emailAddress");
