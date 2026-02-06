// lib/actions/auth-actions.ts
"use server";

import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { safe } from "@/utils/validators/safe";
import { cookies } from "next/headers"; // Or your preferred session tool

interface LoginData {
  email: string;
  password: string;
}

export async function loginAction(data: LoginData) {
  return await safe((async () => {
    const { email, password } = data;

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // 2. CHECK THE STATUS-GATE (The verification check)
    if (!user.emailVerifiedAt) {
      throw new Error("Please verify your email before logging in.");
    }

    // 3. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    // 4. Create Session (Example logic)
    // Here you would typically set a JWT cookie or use an auth library
    // cookies().set("session", "your-session-logic-here");

    return { success: true, userId: user.id };
  })());
}
