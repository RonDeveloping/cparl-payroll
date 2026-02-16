// constants/routes.ts

export const ROUTES = {
  // Page Routes (Front-end showing things, not doing sthing with the data)
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESEND: "/auth/resend",
    EMAIL_VERIFIED: "/auth/email-verified",
    CHECK_EMAIL: "/auth/check-email",
    CHECK_PHONE: "/auth/check-phone",
    RESET_PASSWORD: "/auth/reset-password",
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
  },
} as const;
