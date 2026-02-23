// app/api/payments/route.ts
import prisma from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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

    // Extract last 4 digits
    const last4 = cardNumber.slice(-4);

    // Detect card brand
    const brand = detectCardBrand(cardNumber);

    // TODO: Tokenize card with payment processor (Stripe/Square)
    // For now, use a placeholder payment method ID
    const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save to database
    const paymentCard = await prisma.paymentCard.create({
      data: {
        userId: session.userId,
        brand,
        last4,
        expMonth: expiryMonth,
        expYear: expiryYear,
        cardholderName: cardholderName || null,
        billingPostalCode: billingPostalCode || null,
        paymentMethodId,
        isDefault: false,
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
