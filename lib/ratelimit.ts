// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Create the Redis client (uses UPSTASH_REDIS_REST_URL/TOKEN from .env)
const redis = Redis.fromEnv();

// 2. Create the email Limiter
export const emailSendLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute per IP
  analytics: true,
});

// Dedicated limiter for login email change requests.
export const loginEmailChangeLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  analytics: true,
});

// Example config for phone-specific limits; cost concerns
export const phoneSendLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"), // 3 sends per 10 mins
});

//second limiter for checking the phone code to prevent brute-force
export const phoneCheckLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "5 m"), // 5 guesses per 5 mins
});

// Limiter for 2FA code resend requests
export const login2FAResendLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"), // 3 resends per 10 min
});

// Limiter for password setup link resend requests
export const passwordSetupResendLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"), // 3 resends per 10 min
});

// 2FA login configuration
export const LOGIN_2FA_LOCKOUT = {
  maxAttempts: 5,
} as const;
