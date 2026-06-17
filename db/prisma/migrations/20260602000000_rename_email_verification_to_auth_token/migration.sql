-- Rename generic verification token table to clearer name
ALTER TABLE "email_verification" RENAME TO "auth_token";
