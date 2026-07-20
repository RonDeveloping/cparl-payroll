-- Allow earning codes to be retired without deleting historical references.
ALTER TABLE "earning_codes"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
