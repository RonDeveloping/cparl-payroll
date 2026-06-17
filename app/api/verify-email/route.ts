// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";

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

  return NextResponse.json({ error: ERRORS.INVALID_TOKEN }, { status: 400 });
}
