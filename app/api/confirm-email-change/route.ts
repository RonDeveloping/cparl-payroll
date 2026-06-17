// app/api/confirm-email-change/route.ts
import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import { ERRORS } from "@/constants/errors";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: ERRORS.INVALID_TOKEN }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.authToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.type !== "EMAIL_VERIFICATION") {
        return { status: 400 as const, error: ERRORS.INVALID_TOKEN };
      }

      if (tokenRecord.expiresAt < new Date()) {
        await tx.authToken.deleteMany({ where: { id: tokenRecord.id } });
        return {
          status: 400 as const,
          error: ERRORS.VERIFICATION_LINK_EXPIRED,
        };
      }

      const candidate = tokenRecord.user.candidateEmail?.toLowerCase().trim();
      if (!candidate) {
        await tx.authToken.deleteMany({ where: { id: tokenRecord.id } });
        return { status: 400 as const, error: ERRORS.INVALID_TOKEN };
      }

      const existing = await tx.user.findFirst({
        where: {
          OR: [
            { slug: candidate },
            { email: { equals: candidate, mode: "insensitive" } },
          ],
          NOT: { id: tokenRecord.userId },
        },
        select: { id: true },
      });

      if (existing) {
        return { status: 409 as const, error: ERRORS.ACCOUNT_EXISTS };
      }

      const updatedUser = await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          email: candidate,
          slug: candidate,
          candidateEmail: null,
          emailVerifiedAt: new Date(),
        },
        select: { email: true, contactId: true },
      });

      await tx.authToken.deleteMany({ where: { id: tokenRecord.id } });

      await tx.email.updateMany({
        where: { contactId: updatedUser.contactId },
        data: { isPrimary: false },
      });

      await tx.email.upsert({
        where: {
          contactId_emailAddress: {
            contactId: updatedUser.contactId,
            emailAddress: candidate,
          },
        },
        update: { isPrimary: true },
        create: {
          contactId: updatedUser.contactId,
          emailAddress: candidate,
          isPrimary: true,
        },
      });

      return {
        status: 200 as const,
        email: updatedUser.email,
      };
    });

    if (result.status !== 200) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, email: result.email });
  } catch (error) {
    console.error("[confirm-email-change] failed", error);
    return NextResponse.json(
      { error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
