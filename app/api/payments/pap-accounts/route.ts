import prisma from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isValidInstitutionCode } from "@/constants/financial-institutions";
import { ERRORS } from "@/constants/errors";

type PaymentAccountCreateResult = {
  id: string;
  label: string | null;
  institutionNumber: number;
  branchNumber: number;
  accountLast4: string;
  currency: string;
  isDefault: boolean;
  verificationStatus: string;
  createdAt: Date;
};

type PaymentAccountClientLike = {
  count: (args: { where: { userId: string } }) => Promise<number>;
  create: (args: {
    data: {
      userId: string;
      label: string | null;
      institutionNumber: number;
      branchNumber: number;
      accountNumber: string;
      accountLast4: string;
      currency: string;
      isDefault: boolean;
      verificationStatus: string;
    };
    select: Record<string, true>;
  }) => Promise<PaymentAccountCreateResult>;
};

function parseInstitutionNumber(value: unknown): number | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 3) return null;

  const parsed = Number.parseInt(digits, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseBankDetails(value: unknown) {
  const formatted = String(value ?? "").trim();
  const match = formatted.match(/^(\d{5})-(\d{7,12})$/);
  if (!match) return null;

  const branchNumber = Number.parseInt(match[1], 10);
  if (!Number.isInteger(branchNumber)) return null;

  return {
    branchNumber,
    accountNumber: match[2],
  };
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing account id" },
        { status: 400 },
      );
    }

    type PapDeleteClient = {
      findFirst: (args: {
        where: { id?: string; userId: string };
        orderBy?: { createdAt: "asc" | "desc" };
        select: { id: true; isDefault?: true };
      }) => Promise<{ id: string; isDefault: boolean } | null>;
      delete: (args: { where: { id: string } }) => Promise<unknown>;
      update: (args: {
        where: { id: string };
        data: { isDefault: boolean };
      }) => Promise<unknown>;
    };

    const paymentAccountClient = (
      prisma as unknown as { paymentAccount: PapDeleteClient }
    ).paymentAccount;

    const account = await paymentAccountClient.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, isDefault: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await paymentAccountClient.delete({ where: { id } });

    if (account.isDefault) {
      const next = await paymentAccountClient.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await paymentAccountClient.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PAP account:", error);
    return NextResponse.json(
      { error: "Failed to delete PAP account" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const institutionNumber = parseInstitutionNumber(body.institutionNumber);
    const bankDetails = parseBankDetails(body.bankDetails);
    const label =
      typeof body.label === "string" && body.label.trim().length > 0
        ? body.label.trim().slice(0, 60)
        : null;

    if (!institutionNumber || !bankDetails) {
      return NextResponse.json(
        {
          error:
            "Invalid account details. Use Bank# and Transit#-Account# format.",
        },
        { status: 400 },
      );
    }

    if (!isValidInstitutionCode(institutionNumber)) {
      return NextResponse.json(
        {
          error: ERRORS.INSTITUTION_INVALID_PER_CPA,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { contactId: true },
    });

    const employee = user?.contactId
      ? await prisma.employee.findFirst({
          where: { contactId: user.contactId },
          select: { id: true },
        })
      : null;

    const createdAccount = await prisma.$transaction(async (tx) => {
      let createdBankAccount: {
        label: string | null;
        institutionNumber: number;
        branchNumber: number;
        accountNumber: string;
        currency: string;
        verificationStatus: string;
      } | null = null;

      if (employee) {
        const existingBankAccountCount = await tx.bankAccount.count({
          where: {
            employeeId: employee.id,
            isActive: true,
          },
        });

        createdBankAccount = await tx.bankAccount.create({
          data: {
            employeeId: employee.id,
            institutionNumber,
            branchNumber: bankDetails.branchNumber,
            accountNumber: bankDetails.accountNumber,
            currency: "CAD",
            isPrimary: existingBankAccountCount === 0,
            label,
            priority: existingBankAccountCount + 1,
          },
          select: {
            label: true,
            institutionNumber: true,
            branchNumber: true,
            accountNumber: true,
            currency: true,
            verificationStatus: true,
          },
        });
      }

      const paymentAccountClient = (
        tx as unknown as { paymentAccount: PaymentAccountClientLike }
      ).paymentAccount;
      const existingPaymentAccountCount = await paymentAccountClient.count({
        where: { userId: session.userId },
      });

      return paymentAccountClient.create({
        data: {
          userId: session.userId,
          label: createdBankAccount?.label ?? label,
          institutionNumber:
            createdBankAccount?.institutionNumber ?? institutionNumber,
          branchNumber:
            createdBankAccount?.branchNumber ?? bankDetails.branchNumber,
          accountNumber:
            createdBankAccount?.accountNumber ?? bankDetails.accountNumber,
          accountLast4: (
            createdBankAccount?.accountNumber ?? bankDetails.accountNumber
          ).slice(-4),
          currency: createdBankAccount?.currency ?? "CAD",
          isDefault: existingPaymentAccountCount === 0,
          verificationStatus:
            createdBankAccount?.verificationStatus ?? "unverified",
        },
        select: {
          id: true,
          label: true,
          institutionNumber: true,
          branchNumber: true,
          accountLast4: true,
          currency: true,
          isDefault: true,
          verificationStatus: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        account: {
          id: createdAccount.id,
          label: createdAccount.label,
          institutionNumber: createdAccount.institutionNumber,
          branchNumber: createdAccount.branchNumber,
          accountLast4: createdAccount.accountLast4,
          currency: createdAccount.currency,
          isDefault: createdAccount.isDefault,
          verificationStatus: createdAccount.verificationStatus,
          createdAt: createdAccount.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating PAP account:", error);
    return NextResponse.json(
      { error: "Failed to create saved account" },
      { status: 500 },
    );
  }
}
