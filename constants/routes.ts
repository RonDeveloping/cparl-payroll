// constants/routes.ts

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESEND: "/auth/resend",
    VERIFY: "/auth/verify",
  },

  DASHBOARD: {
    HOME: "/dashboard",
    SETTINGS: "/dashboard/settings",
  },
} as const;
