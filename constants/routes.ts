// constants/routes.ts

export const ROUTES = {
  // Page Routes (Front-end showing things, not doing sthing with the data)
  AUTH: {
    LOGIN: "/auth/login",
    LOGIN_2FA: "/auth/login-2fa",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    SETUP_PASSWORD: "/auth/setup-password",
    RESEND: "/auth/resend",
    EMAIL_VERIFIED: "/auth/email-verified",
    CHECK_EMAIL: "/auth/check-email",
    CHECK_PHONE: "/auth/check-phone",
    RESET_PASSWORD: "/auth/reset-password",
    CONFIRM_EMAIL_CHANGE: "/auth/confirm-email-change",
  },

  DASHBOARD: {
    HOME: "/dashboard",
    SETTINGS: "/dashboard/settings",
  },

  // API Routes (Back-end, doing things with the data, not rendering a page)
  API: {
    REGISTER: "/api/register",
    LOGIN: "/api/login",
    RESEND_VERIFICATION: "/api/resend-verification",
    SETUP_PASSWORD: "/api/activate-account",
  },
} as const;
