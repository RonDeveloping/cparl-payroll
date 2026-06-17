// app/api/register/route.ts
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";
import { Redis } from "@upstash/redis";
import { issuePasswordSetupLink } from "@/lib/password-setup";

// This automatically looks for UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});

// Helper to create a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  // Only accept email in the body
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: ERRORS.TOO_MANY_ATTEMPTS },
      { status: 429 },
    );
  }
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: ERRORS.INVALID_EMAIL },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { slug: email.toLowerCase().trim() },
          {
            email: { equals: email.toLowerCase().trim(), mode: "insensitive" },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        passwordHash: true,
      },
    });

    if (existingUser?.emailVerifiedAt && !existingUser.passwordHash) {
      const setupLink = await issuePasswordSetupLink(existingUser.email);

      if (!setupLink.success) {
        return NextResponse.json(
          { error: setupLink.error },
          { status: setupLink.reason === "send-failed" ? 500 : 400 },
        );
      }

      return NextResponse.json({
        success: true,
        flow: "setup-password",
        email: setupLink.email,
        message:
          "We found your account and sent a link to finish setting up your password.",
      });
    }

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: ERRORS.ACCOUNT_EXISTS },
        { status: 409 },
      );
    }

    // Check for existing pending verification
    const existing = await prisma.verificationEmailToken.findFirst({
      where: { email: email.toLowerCase().trim() },
    }); // If error: Property does not exist, run `npx prisma generate` and check schema
    if (existing && existing.expiresAt > new Date()) {
      // If a valid pending exists, do not send another
      return NextResponse.json({
        success: true,
        message: "Verification email sent. Please check your inbox.",
      });
    }
    // Generate a token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    // Store pending verification (since email is not unique, upsert by findFirst+update/create)
    if (existing) {
      await prisma.verificationEmailToken.update({
        where: { id: existing.id },
        data: { token, expiresAt },
      });
    } else {
      await prisma.verificationEmailToken.create({
        data: {
          email: email.toLowerCase().trim(),
          token,
          expiresAt,
        },
      });
    }
    await sendVerificationEmail(email, token, new Date());
    const elapsedTime = Date.now() - startTime;
    const minResponseTime = 500;
    if (elapsedTime < minResponseTime) {
      await sleep(minResponseTime - elapsedTime);
    }
    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
// Removed unused import for isEmailTaken
