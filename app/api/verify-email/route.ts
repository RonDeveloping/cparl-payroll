// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";
import { generatePasswordSetupToken } from "@/lib/password-setup";

async function setupUrlForVerifiedUser(email: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { slug: email.toLowerCase().trim() },
        { email: { equals: email, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      passwordHash: true,
    },
  });

  if (user?.emailVerifiedAt && !user.passwordHash) {
    return generatePasswordSetupToken(user.id, user.email);
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: ERRORS.INVALID_TOKEN }, { status: 400 });
  }
  const pendingVerification = await prisma.verificationEmailToken.findUnique({
    where: { token },
  });

  if (pendingVerification) {
    if (pendingVerification.expiresAt < new Date()) {
      const setupUrl = await setupUrlForVerifiedUser(pendingVerification.email);
      if (setupUrl) {
        return NextResponse.json({ setupUrl });
      }
      return NextResponse.json(
        {
          error: ERRORS.VERIFICATION_LINK_EXPIRED,
          email: pendingVerification.email,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ email: pendingVerification.email });
  }

  // Token already consumed — fall back to the email query param if present.
  const emailParam = searchParams.get("email");
  if (emailParam) {
    const setupUrl = await setupUrlForVerifiedUser(emailParam);
    if (setupUrl) {
      return NextResponse.json({ setupUrl });
    }
  }

  return NextResponse.json({ error: ERRORS.INVALID_TOKEN }, { status: 400 });
}
