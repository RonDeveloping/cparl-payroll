// app/api/register/route.ts
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { isEmailTaken, upsertUser } from "@/lib/actions/user";
import { Redis } from "@upstash/redis";

// This automatically looks for UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});

// Helper to create a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const startTime = Date.now();
  // 1. IP Rate Limiting
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in an hour." },
      { status: 429 },
    );
  }

  try {
    const data = await req.json();
    const emailTaken = await isEmailTaken(data.email);

    if (!emailTaken) {
      const result = await upsertUser(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    } else {
      // OPTIONAL: Trigger a "You already have an account" email here
      // console.log("Silent skip: Email already exists");
    }
    const elapsedTime = Date.now() - startTime;
    const minResponseTime = 500; // 0.5 second
    if (elapsedTime < minResponseTime) {
      await sleep(minResponseTime - elapsedTime);
    }
    // 4. GENERIC RESPONSE
    // We return 200 even if the user already existed.
    return NextResponse.json({
      success: true,
      message: "Registration processed. Please check your email.",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
