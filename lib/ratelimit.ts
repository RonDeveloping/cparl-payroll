import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Create the Redis client (uses UPSTASH_REDIS_REST_URL/TOKEN from .env)
const redis = Redis.fromEnv();

// 2. Create the Limiter
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute per IP
  analytics: true,
});
