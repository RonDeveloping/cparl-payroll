-- Drop the redundant composite business_number column.
-- The three split fields (business_bn9, business_program_id, business_account_ref)
-- are now the single source of truth.
ALTER TABLE "tenant" DROP COLUMN "business_number";
