-- Add split business number fields to tenant
ALTER TABLE "tenant"
ADD COLUMN "business_bn9" CHAR(9),
ADD COLUMN "business_program_id" CHAR(2),
ADD COLUMN "business_account_ref" CHAR(4);

-- Backfill split fields from existing canonical values in business_number
-- Expected canonical format: 123456789 RP 0001
UPDATE "tenant"
SET
  "business_bn9" = SUBSTRING(REGEXP_REPLACE(COALESCE("business_number", ''), '[^0-9]', '', 'g') FROM 1 FOR 9),
  "business_program_id" = CASE
    WHEN UPPER(COALESCE("business_number", '')) LIKE '% RP %' THEN 'RP'
    ELSE NULL
  END,
  "business_account_ref" = CASE
    WHEN LENGTH(REGEXP_REPLACE(COALESCE("business_number", ''), '[^0-9]', '', 'g')) >= 13
      THEN SUBSTRING(REGEXP_REPLACE(COALESCE("business_number", ''), '[^0-9]', '', 'g') FROM 10 FOR 4)
    WHEN LENGTH(REGEXP_REPLACE(COALESCE("business_number", ''), '[^0-9]', '', 'g')) >= 9
      THEN RPAD(SUBSTRING(REGEXP_REPLACE(COALESCE("business_number", ''), '[^0-9]', '', 'g') FROM 10 FOR 4), 4, '0')
    ELSE NULL
  END
WHERE "business_number" IS NOT NULL;

CREATE INDEX "tenant_business_bn9_business_program_id_business_account_ref_idx"
  ON "tenant"("business_bn9", "business_program_id", "business_account_ref");
