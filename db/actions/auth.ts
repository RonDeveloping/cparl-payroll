"use server";

import prisma from "@/db/prismaDrizzle";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export async function checkEmailAvailability(email: string) {
  const user = await prisma.user.findUnique({
    where: { securityEmail: email.toLowerCase().trim() },
    select: { id: true },
  });
  return !user; // Returns true if available
}

export async function registerUserAction(values: unknown) {
  // 1. Server-side validation
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields provided." };
  }

  const { email, password, displayName } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 2. Check if user exists
      const existingUser = await tx.user.findUnique({
        where: { securityEmail: email },
      });
      if (existingUser) throw new Error("Email already registered.");

      // 3. Create the Contact Profile first
      const contact = await tx.contact.create({
        data: {
          givenName: displayName.split(" ")[0] || "",
          familyName: displayName.split(" ")[1] || "",
          displayName: displayName,
        },
      });

      // 4. Create the User Identity linked to that Contact
      const user = await tx.user.create({
        data: {
          securityEmail: email.toLowerCase(),
          passwordHash: hashedPassword,
          displayName: displayName,
          contactId: contact.id,
          slug: email.split("@")[0] + Math.floor(Math.random() * 1000), // Basic slug logic
        },
      });

      return { user };
    });

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Database error occurred.";
    return { error: message };
  }
}
