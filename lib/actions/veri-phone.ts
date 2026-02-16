//lib/actions/phone-actions.ts
"use server";

import prisma from "@/db/prismaDrizzle"; // Adjust based on your actual prisma export
import { phoneCheckLimit, phoneSendLimit } from "@/lib/ratelimit"; //assuming upstash/redis
import { headers } from "next/headers";
import { getSession } from "../session";
import { safe } from "@/utils/validators/safe";

//Generate and send a phone verification code
export async function sendPhoneVerification() {
  // 1. Authenticate the user
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.userId;

  // 2. Rate Limit strictly (SMS costs money!)
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitOk } = await phoneSendLimit.limit(`sms_${ip}`);
  if (!limitOk) {
    return {
      success: false,
      error: "Too many attempts. Please try again in 10 minutes.",
    };
  }
  return await safe(
    (async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.phone) throw new Error("No phone number found.");
      // 3. Generate 6-digit code
      //TODO: integrate Twilio or similar service here instead of console.log later on
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.phoneVerification.upsert({
        where: { userId },
        update: { code, expiresAt },
        create: { userId, code, expiresAt },
      });

      console.log(`[SMS Simulation] To: ${user.phone} | Code: ${code}`);
      return { success: true };
    })(),
  );
}

export async function verifyPhoneCode(userId: string, inputCode: string) {
  // Rate limit the "Check" as well to prevent brute-forcing the 6-digit code
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitOK } = await phoneCheckLimit.limit(`phone_check_${ip}`);

  if (!limitOK) {
    return {
      success: false,
      error:
        "Too many incorrect attempts. Please wait 5 minutes before trying again.",
    };
  }

  return await safe(
    (async () => {
      const record = await prisma.phoneVerification.findUnique({
        where: { userId },
      });

      if (!record || record.code !== inputCode) {
        throw new Error("Invalid verification code.");
      }

      if (new Date() > record.expiresAt) {
        throw new Error("Code has expired.");
      }

      // Success: Update user and delete the verification token
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { phoneVerifiedAt: new Date() },
        }),
        prisma.phoneVerification.delete({
          where: { userId },
        }),
      ]);

      return { success: true };
    })(),
  );
}

export async function resendVerificationPhone(phone: string) {
  // 1. RATE LIMIT CHECK
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";

  const { success: limitOK } = await phoneSendLimit.limit(`resend_${ip}`);

  if (!limitOK) {
    return {
      success: false,
      error: "Too many requests. Please wait a moment before trying again.",
    };
  }

  return { success: true, message: "Verification phone sent." };
}
