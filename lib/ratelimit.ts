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
