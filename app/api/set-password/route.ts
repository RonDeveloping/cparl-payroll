// app/api/set-password/route.ts

import { NextResponse } from "next/server";
import prisma from "@/db/prismaDrizzle";
import bcrypt from "bcrypt";
import { ERRORS } from "@/constants/errors";
import { CURRENT_TERMS_VERSION } from "@/constants/terms";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

function getGivenNameFromEmail(email: string): string {
  const localPart = email.split("@")[0]?.trim() ?? "";
  const trimmedLeadingDigits = localPart.replace(/^\d+/, "").trim();
  return trimmedLeadingDigits || localPart;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, confirmPassword } = data;
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: ERRORS.INVALID_TOKEN },
        { status: 400 },
      );
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: ERRORS.PASSWORD_TOO_SHORT },
        { status: 400 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: ERRORS.PASSWORDS_DO_NOT_MATCH },
        { status: 400 },
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const givenNameFromEmail = getGivenNameFromEmail(normalizedEmail);
    const slug = normalizedEmail;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { slug },
          update: {
            passwordHash: hashedPassword,
            emailVerifiedAt: new Date(),
            candidateEmail: null,
            termsAcceptedAt: new Date(),
            termsVersionAccepted: CURRENT_TERMS_VERSION,
          },
          create: {
            slug,
            email: normalizedEmail,
            passwordHash: hashedPassword,
            emailVerifiedAt: new Date(),
            candidateEmail: null,
            contactId: crypto.randomUUID(),
            termsAcceptedAt: new Date(),
            termsVersionAccepted: CURRENT_TERMS_VERSION,
          },
        });

        // Create or ensure contact exists with email
        await tx.contact.upsert({
          where: { id: user.contactId },
          update: {},
          create: {
            id: user.contactId,
            coreName: givenNameFromEmail,
            kindName: "",
            subject: "INDIVIDUAL",
            source: "USER",
          },
        });

        // Create or update email record for contact
        await tx.email.upsert({
          where: {
            contactId_emailAddress: {
              contactId: user.contactId,
              emailAddress: normalizedEmail,
            },
          },
          update: { isPrimary: true },
          create: {
            contactId: user.contactId,
            emailAddress: normalizedEmail,
            isPrimary: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { slug },
              { email: { equals: normalizedEmail, mode: "insensitive" } },
            ],
          },
          select: { id: true, contactId: true },
        });

        if (!existing) {
          throw error;
        }

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: existing.id },
            data: {
              passwordHash: hashedPassword,
              emailVerifiedAt: new Date(),
              candidateEmail: null,
              termsAcceptedAt: new Date(),
              termsVersionAccepted: CURRENT_TERMS_VERSION,
            },
          });

          // Ensure legacy/missing contact rows are repaired before email upsert.
          await tx.contact.upsert({
            where: { id: existing.contactId },
            update: {},
            create: {
              id: existing.contactId,
              coreName: givenNameFromEmail,
              kindName: "",
              subject: "INDIVIDUAL",
              source: "USER",
            },
          });

          // Update email record to ensure it's primary
          await tx.email.upsert({
            where: {
              contactId_emailAddress: {
                contactId: existing.contactId,
                emailAddress: normalizedEmail,
              },
            },
            update: { isPrimary: true },
            create: {
              contactId: existing.contactId,
              emailAddress: normalizedEmail,
              isPrimary: true,
            },
          });
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[set-password] failed", error);
    return NextResponse.json(
      { error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
