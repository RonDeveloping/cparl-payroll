-- CreateTable
CREATE TABLE "payment_card" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "cardholder_name" TEXT,
    "billing_postal_code" TEXT,
    "payment_method_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_card_user_id_idx" ON "payment_card"("user_id");

-- AddForeignKey
ALTER TABLE "payment_card" ADD CONSTRAINT "payment_card_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "tenant_business_bn9_business_program_id_business_account_ref_id" RENAME TO "tenant_business_bn9_business_program_id_business_account_re_idx";
