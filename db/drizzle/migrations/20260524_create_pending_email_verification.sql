-- Migration: Create pending_email_verification table
CREATE TABLE IF NOT EXISTS pending_email_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pending_email_verification_token ON pending_email_verification(token);
CREATE INDEX IF NOT EXISTS idx_pending_email_verification_email ON pending_email_verification(email);
