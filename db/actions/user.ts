import bcrypt from "bcrypt";
import prisma from "@/db/prismaDrizzle";
import { normalizeId } from "@/utils/formatters/idSlug";

export async function upsertUser(
  input: string,
  email: string,
  password?: string,
) {
  const normalizedSlug = normalizeId(input || email);
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  return await prisma.user.upsert({
    where: { slug: normalizedSlug },
    update: {
      displayName: input, // Update display name if they changed casing
      securityEmail: email.toLowerCase().trim(),
    },
    create: {
      slug: normalizedSlug,
      displayName: input,
      securityEmail: email.toLowerCase().trim(),
      passwordHash: hashedPassword || "",
      contactId: "placeholder-id",
      // The id is handled automatically by @default(cuid())
    },
  });
}
