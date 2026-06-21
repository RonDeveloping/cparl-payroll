// app/api/payments/route.ts
import prisma from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

type PaymentAccountRow = {
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
  findMany: (args: {
    where: { userId: string };
    orderBy: Array<Record<string, "asc" | "desc">>;
    select: Record<string, unknown>;
  }) => Promise<PaymentAccountRow[]>;
};

function detectCardBrand(cardNumber: string): string {
  const patterns = {
    visa: /^4/,
    mastercard: /^(5[1-5]|2[2-7])/,
    amex: /^3[47]/,
    discover: /^(6011|65|64[4-9]|622)/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand === "mastercard"
        ? "Mastercard"
        : brand === "amex"
          ? "American Express"
          : brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }

  return "Unknown";
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      cardholderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      billingPostalCode,
    } = body;

    // Validate required fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc) {
      return NextResponse.json(
        { error: "Missing required card details" },
        { status: 400 },
      );
    }

    const expMonth = Number.parseInt(String(expiryMonth), 10);
    const expYear = Number.parseInt(String(expiryYear), 10);

    if (
      !Number.isInteger(expMonth) ||
      expMonth < 1 ||
      expMonth > 12 ||
      !Number.isInteger(expYear) ||
      expYear < new Date().getFullYear()
    ) {
      return NextResponse.json(
        { error: "Invalid card expiry date" },
        { status: 400 },
      );
    }

    // Extract last 4 digits
    const last4 = cardNumber.slice(-4);

    // Detect card brand
    const brand = detectCardBrand(cardNumber);

    // TODO: Tokenize card with payment processor (Stripe/Square)
    // For now, use a placeholder payment method ID
    const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const existingCardCount = await prisma.paymentCard.count({
      where: { userId: session.userId },
    });

    // Save to database
    const paymentCard = await prisma.paymentCard.create({
      data: {
        userId: session.userId,
        brand,
        last4,
        expMonth,
        expYear,
        cardholderName: cardholderName || null,
        billingPostalCode: billingPostalCode || null,
        paymentMethodId,
        isDefault: existingCardCount === 0,
      },
    });

    console.log("Payment card saved:", paymentCard);

    return NextResponse.json(
      {
        success: true,
        card: {
          id: paymentCard.id,
          brand: paymentCard.brand,
          last4: paymentCard.last4,
          expMonth: paymentCard.expMonth,
          expYear: paymentCard.expYear,
          cardholderName: paymentCard.cardholderName,
          billingPostalCode: paymentCard.billingPostalCode,
          isDefault: paymentCard.isDefault,
          createdAt: paymentCard.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving payment card:", error);
    return NextResponse.json(
      { error: "Failed to save payment card" },
      { status: 500 },
    );
  }
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
      return NextResponse.json({ error: "Missing card id" }, { status: 400 });
    }

    const card = await prisma.paymentCard.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, isDefault: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await prisma.paymentCard.delete({ where: { id } });

    if (card.isDefault) {
      const next = await prisma.paymentCard.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await prisma.paymentCard.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment card:", error);
    return NextResponse.json(
      { error: "Failed to delete payment card" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.paymentCard.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        brand: true,
        last4: true,
        expMonth: true,
        expYear: true,
        cardholderName: true,
        billingPostalCode: true,
        isDefault: true,
        createdAt: true,
      },
    });

    const paymentAccountClient = (
      prisma as unknown as { paymentAccount: PaymentAccountClientLike }
    ).paymentAccount;
    const papAccounts = await paymentAccountClient.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }, { id: "asc" }],
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

    // TODO: Replace with real credit ledger aggregation once PAP credit events
    // are persisted in a dedicated table.
    const accumulatedCredits = 0;

    return NextResponse.json({
      success: true,
      cards,
      papAccounts: papAccounts.map((account) => ({
        id: account.id,
        label: account.label,
        institutionNumber: account.institutionNumber,
        branchNumber: account.branchNumber,
        accountLast4: account.accountLast4,
        currency: account.currency,
        isDefault: account.isDefault,
        verificationStatus: account.verificationStatus,
        createdAt: account.createdAt,
      })),
      accumulatedCredits,
    });
  } catch (error) {
    console.error("Error fetching payment cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment cards" },
      { status: 500 },
    );
  }
}
