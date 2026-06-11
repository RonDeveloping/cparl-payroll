"use server";
// utils/user/secuirty.ts
// Marks every function in this file as a server-side entry point

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function requestEmailChangeAction(formData: FormData) {
  // 1. Authenticate the caller
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const newEmail = String(formData.get("newEmail") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!newEmail || !password) {
    throw new Error("Missing email or password");
  }

  // ... Insert the validation/token logic here ...

  // 2. Clear the cache for the security settings page
  revalidatePath("/settings/security");

  return { success: true, message: "Check your new email for a link." };
}
