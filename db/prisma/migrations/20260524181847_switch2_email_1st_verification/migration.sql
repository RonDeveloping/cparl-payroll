-- CreateTable
CREATE TABLE "pending_email_verification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_email_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_email_verification_token_key" ON "pending_email_verification"("token");

-- CreateIndex
CREATE INDEX "pending_email_verification_email_idx" ON "pending_email_verification"("email");

-- CreateIndex
CREATE INDEX "pending_email_verification_token_idx" ON "pending_email_verification"("token");
