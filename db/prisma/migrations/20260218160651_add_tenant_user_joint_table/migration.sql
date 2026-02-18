-- CreateTable
CREATE TABLE "tenant_user" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_user_user_id_idx" ON "tenant_user"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_user_tenant_id_user_id_key" ON "tenant_user"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "tenant_user" ADD CONSTRAINT "tenant_user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
