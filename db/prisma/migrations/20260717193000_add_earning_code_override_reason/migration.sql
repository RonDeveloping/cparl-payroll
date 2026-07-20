-- Persist policy override rationale for earning code configuration changes.
ALTER TABLE "earning_codes"
ADD COLUMN "override_reason" TEXT;
