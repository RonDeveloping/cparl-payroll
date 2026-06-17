// app/api/activate-account/route.ts

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";
import { consumeSetupPasswordToken } from "@/lib/password-setup";

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

      // Create (or no-op update) the user row so the account is findable from
      // this point on, even if the user closes the browser before saving a
      // password. passwordHash stays null until set-password runs.
      await prisma.user.upsert({
        where: { slug: normalizedEmail },
        update: {
          emailVerifiedAt: new Date(),
        },
        create: {
          slug: normalizedEmail,
          email: normalizedEmail,
          emailVerifiedAt: new Date(),
          passwordHash: null,
          contactId: crypto.randomUUID(),
        },
      });

      return NextResponse.json({ success: true, email: normalizedEmail });
    }

    const setupTokenResult = await consumeSetupPasswordToken(token);
    if (setupTokenResult.success) {
      return NextResponse.json({
        success: true,
        email: setupTokenResult.email,
      });
    }

    if (setupTokenResult.reason === "not-found") {
      return NextResponse.json(
        { error: ERRORS.VERIFICATION_LINK_EXPIRED },
        { status: 400 },
      );
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
