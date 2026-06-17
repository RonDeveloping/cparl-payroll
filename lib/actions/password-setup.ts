"use server";

import { issuePasswordSetupLink } from "@/lib/password-setup";
import { headers } from "next/headers";
import { passwordSetupResendLimit } from "@/lib/ratelimit";
import { ERRORS } from "@/constants/errors";

export async function requestPasswordSetupLinkAction(email: string) {
  // Rate limit by IP to prevent abuse
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";

  const { success: ipLimitOk } = await passwordSetupResendLimit.limit(
    `password_setup_resend_ip_${ip}`,
  );

  if (!ipLimitOk) {
    return {
      success: false,
      error: ERRORS.TOO_MANY_REQUESTS,
      reason: "send-failed" as const,
    };
  }

  return await issuePasswordSetupLink(email);
}
