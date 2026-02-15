//lib/actions/phone-actions.ts
"use server";

import prisma from "@/db/prismaDrizzle"; // Adjust based on your actual prisma export
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";
import { getSession } from "../session";

export async function sendPhoneCode(newPhone: string) {
  // 1. Authenticate the user
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.userId;

  // 2. Rate Limit strictly (SMS costs money!)
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitOk } = await ratelimit.limit(`sms_${ip}`);
  if (!limitOk) {
    return {
      success: false,
      error: "Too many attempts. Please try again later.",
    };
  }

  // 3. Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.$transaction([
      // A. Update user with the pending phone number
      prisma.user.update({
        where: { id: userId },
        data: { pendingPhone: newPhone.trim() },
      }),
      // B. Delete any old verification codes for this user
      prisma.phoneVerification.deleteMany({
        where: { userId: userId },
      }),
      // C. Create the new verification record
      prisma.phoneVerification.create({
        data: {
          code,
          expiresAt,
          userId: userId,
        },
      }),
    ]);

    // 4. Trigger SMS Send (Mockup)
    // console.log(`Sending SMS to ${newPhone}: Your code is ${code}`);
    // await smsProvider.send(newPhone, `Your verification code is ${code}`);

    return { success: true, message: "Code sent successfully." };
  } catch (error) {
    console.error("SMS_SEND_ERROR", error);
    return { success: false, error: "Failed to send verification code." };
  }
}
