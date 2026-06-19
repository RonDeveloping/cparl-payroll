/*
  Warnings:

  - You are about to drop the column `default_payment_card_id` on the `tenant_settings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('draft', 'open', 'paid', 'overdue', 'void', 'uncollectible');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'reversed');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('stripe', 'paddle', 'manual', 'other');

-- CreateEnum
CREATE TYPE "payment_method_type" AS ENUM ('card', 'pap');

-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "conversational_name_history" DROP CONSTRAINT "conversational_name_history_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "email" DROP CONSTRAINT "email_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "legal_name_history" DROP CONSTRAINT "legal_name_history_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "phone" DROP CONSTRAINT "phone_contact_id_fkey";

-- AlterTable
ALTER TABLE "tenant_settings" DROP COLUMN "default_payment_card_id",
ADD COLUMN     "payment_method_type" "payment_method_type",
ADD COLUMN     "payment_src_id" TEXT;

-- CreateTable
CREATE TABLE "billing_customer" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "billing_email" TEXT,
    "external_customer_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice" (
    "id" TEXT NOT NULL,
    "billing_customer_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'draft',
    "billing_interval" "billing_interval" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_total" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "issued_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "external_invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice_line" (
    "id" TEXT NOT NULL,
    "billing_invoice_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "billing_customer_id" TEXT NOT NULL,
    "billing_invoice_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "payment_method_type" "payment_method_type" NOT NULL DEFAULT 'card',
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "provider" "payment_provider" NOT NULL,
    "payment_method_snapshot" JSONB,
    "provider_transaction_id" TEXT,
    "failure_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_customer_tenant_id_key" ON "billing_customer"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_customer_external_customer_id_key" ON "billing_customer"("external_customer_id");

-- CreateIndex
CREATE INDEX "billing_customer_tenant_id_idx" ON "billing_customer"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoice_invoice_number_key" ON "billing_invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "billing_invoice_tenant_id_status_idx" ON "billing_invoice"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "billing_invoice_billing_customer_id_status_idx" ON "billing_invoice"("billing_customer_id", "status");

-- CreateIndex
CREATE INDEX "billing_invoice_line_billing_invoice_id_idx" ON "billing_invoice_line"("billing_invoice_id");

-- CreateIndex
CREATE INDEX "billing_invoice_line_plan_id_idx" ON "billing_invoice_line"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_provider_transaction_id_key" ON "payment_transaction"("provider_transaction_id");

-- CreateIndex
CREATE INDEX "payment_transaction_tenant_id_status_idx" ON "payment_transaction"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payment_transaction_tenant_id_payment_method_type_idx" ON "payment_transaction"("tenant_id", "payment_method_type");

-- CreateIndex
CREATE INDEX "payment_transaction_billing_customer_id_status_idx" ON "payment_transaction"("billing_customer_id", "status");

-- CreateIndex
CREATE INDEX "payment_transaction_billing_invoice_id_idx" ON "payment_transaction"("billing_invoice_id");

-- AddForeignKey
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_billing_customer_id_fkey" FOREIGN KEY ("billing_customer_id") REFERENCES "billing_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_billing_customer_id_fkey" FOREIGN KEY ("billing_customer_id") REFERENCES "billing_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_name_history" ADD CONSTRAINT "legal_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversational_name_history" ADD CONSTRAINT "conversational_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
