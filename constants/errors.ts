// constants/errors.ts
export const ERRORS = {
  INVALID_TOKEN:
    "This verification link is invalid or has already been used. Please log in directly using",
  PASSWORD_TOO_SHORT: "Password is too short or missing.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
  VERIFICATION_LINK_EXPIRED:
    "Verification link has expired; please request a new one.",
  VERIFICATION_TOKEN_GONE:
    "This verification link has already been used. Please log in directly.",
  ACCOUNT_EXISTS: "Account already exists for this email.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please try again in an hour.",
  INVALID_EMAIL: "Invalid email.",
  INVALID_INPUT: "Invalid input.",
  UNAUTHORIZED: "Unauthorized",
  MISSING_CARD_DETAILS: "Missing required card details",
  FAILED_TO_SAVE_PAYMENT: "Failed to save payment card",
  FAILED_TO_FETCH_TENANTS: "Failed to fetch tenants",
  TOO_MANY_REQUESTS:
    "Too many requests. Please wait a moment before trying again.",
  DATABASE_ERROR: "Database error. Please try again.",
  FAILED_TO_SEND_EMAIL: "Failed to send email. Please try again.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  PHONE_TOO_MANY_ATTEMPTS: "Too many attempts. Please try again in 10 minutes.",
  PHONE_TOO_MANY_CHECKS:
    "Too many incorrect attempts. Please wait 5 minutes before trying again.",
  PHONE_NO_NUMBER: "No phone number found.",
  PHONE_INVALID_CODE: "Invalid verification code.",
  PHONE_CODE_EXPIRED: "Code has expired.",
  LOGIN_2FA_LOCKED: "Too many failed attempts. Please request new code.",
  PHONE_SENT: "Verification phone sent.",
  SLUG_TAKEN: "This slug is already taken",
  REAUTH_REQUIRED:
    "For security, please log in again before changing your login email.",
  BANK_NUMBER_MUST_BE_3_DIGITS: "Bank number must be 3 digits.",
  INSTITUTION_INVALID_PER_CPA: "Invalid per CPA",
  TRANSIT_ACCOUNT_INVALID_FORMAT:
    "Use format 12345-1234567 (5-digit transit, 7-12 digit account).",
};
