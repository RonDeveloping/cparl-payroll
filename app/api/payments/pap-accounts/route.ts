import prisma from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

type PaymentAccountCreateResult = {
  id: string;
  label: string | null;
  institutionNumber: number;
  branchNumber: number;
  accountLast4: string;
  currency: string;
  isDefault: boolean;
  verificationStatus: string;
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
  const match = formatted.match(/^(\d{5})-(\d{5,17})$/);
  if (!match) return null;

  const branchNumber = Number.parseInt(match[1], 10);
  if (!Number.isInteger(branchNumber)) return null;

  return {
    branchNumber,
    accountNumber: match[2],
  };
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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { contactId: true },
    });

    if (!user?.contactId) {
      return NextResponse.json(
        { error: "Unable to resolve user contact record." },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { contactId: user.contactId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          error: "Employee profile is required before adding a saved account.",
        },
        { status: 400 },
      );
    }

    const createdAccount = await prisma.$transaction(async (tx) => {
      const existingBankAccountCount = await tx.bankAccount.count({
        where: {
          employeeId: employee.id,
          isActive: true,
        },
      });

      const createdBankAccount = await tx.bankAccount.create({
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
          id: true,
          label: true,
          institutionNumber: true,
          branchNumber: true,
          accountNumber: true,
          currency: true,
          verificationStatus: true,
        },
      });

      const paymentAccountClient = (
        tx as unknown as { paymentAccount: PaymentAccountClientLike }
      ).paymentAccount;
      const existingPaymentAccountCount = await paymentAccountClient.count({
        where: { userId: session.userId },
      });

      return paymentAccountClient.create({
        data: {
          userId: session.userId,
          label: createdBankAccount.label,
          institutionNumber: createdBankAccount.institutionNumber,
          branchNumber: createdBankAccount.branchNumber,
          accountNumber: createdBankAccount.accountNumber,
          accountLast4: createdBankAccount.accountNumber.slice(-4),
          currency: createdBankAccount.currency,
          isDefault: existingPaymentAccountCount === 0,
          verificationStatus: createdBankAccount.verificationStatus,
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
