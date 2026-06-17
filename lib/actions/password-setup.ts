"use server";

import { issuePasswordSetupLink } from "@/lib/password-setup";

export async function requestPasswordSetupLinkAction(email: string) {
  return await issuePasswordSetupLink(email);
}
