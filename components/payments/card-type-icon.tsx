type CardBrand = "visa" | "mastercard" | "amex" | "discover" | null;

function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, "");

  // Visa: starts with 4
  if (/^4/.test(digits)) return "visa";

  // Mastercard: starts with 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) {
    return "mastercard";
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(digits)) return "amex";

  // Discover: starts with 6011, 622126-622925, 644, 645, 646, 647, 648, 649, or 65
  if (
    /^(6011|65|64[4-9]|622(12[6-9]|1[3-9]|[2-8])|6220[0-9]|62212[0-5])/.test(
      digits,
    )
  ) {
    return "discover";
  }

  return null;
}

export default function CardTypeIcon({ cardNumber }: { cardNumber?: string }) {
  const brand = detectCardBrand(cardNumber || "");

  const brandLabel: Record<CardBrand, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    null: "",
  };

  return (
    <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
      {brand ? brandLabel[brand] : ""}
    </div>
  );
}
