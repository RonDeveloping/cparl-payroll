// app/api/activate-account/route.ts

import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { token } = data;
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: ERRORS.INVALID_TOKEN },
        { status: 400 },
      );
    }
    // First handle pending registration tokens.
    const pending = await prisma.verificationEmailToken.findUnique({
      where: { token },
    });
    if (pending) {
      if (pending.expiresAt < new Date()) {
        return NextResponse.json(
          { error: ERRORS.VERIFICATION_LINK_EXPIRED },
          { status: 400 },
        );
      }

      const normalizedEmail = pending.email.toLowerCase().trim();

      // Consume token; deleteMany keeps this idempotent under duplicate requests.
      await prisma.verificationEmailToken.deleteMany({ where: { token } });
      return NextResponse.json({ success: true, email: normalizedEmail });
    }

    return NextResponse.json({ error: ERRORS.INVALID_TOKEN }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
