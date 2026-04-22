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

  if (!brand) {
    return (
      <div className="flex h-5 w-8 items-center justify-center rounded border border-slate-300 bg-slate-100 text-slate-500">
        {/* Realistic card SVG: card body, stripe, chip */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 20"
          width="28"
          height="18"
          aria-hidden="true"
        >
          {/* Card body */}
          <rect
            x="0"
            y="0"
            width="32"
            height="20"
            rx="2"
            ry="2"
            fill="#94a3b8"
          />
          {/* Magnetic stripe */}
          <rect x="0" y="4" width="32" height="4" fill="#64748b" />
          {/* Chip */}
          <rect
            x="4"
            y="10"
            width="6"
            height="5"
            rx="1"
            ry="1"
            fill="#e2c97e"
          />
          <line
            x1="7"
            y1="10"
            x2="7"
            y2="15"
            stroke="#c9a84c"
            strokeWidth="0.5"
          />
          <line
            x1="4"
            y1="12.5"
            x2="10"
            y2="12.5"
            stroke="#c9a84c"
            strokeWidth="0.5"
          />
          {/* Dots for card number */}
          <circle cx="14" cy="14" r="1" fill="#cbd5e1" />
          <circle cx="17" cy="14" r="1" fill="#cbd5e1" />
          <circle cx="20" cy="14" r="1" fill="#cbd5e1" />
          <circle cx="23" cy="14" r="1" fill="#cbd5e1" />
        </svg>
      </div>
    );
  }

  if (brand === "visa") {
    return (
      <div className="flex h-5 w-8 items-center justify-center rounded border border-blue-200 bg-blue-50 px-1">
        <span className="text-[11px] font-black tracking-wide text-blue-700">
          VISA
        </span>
      </div>
    );
  }

  if (brand === "mastercard") {
    return (
      <div className="relative h-5 w-8 rounded border border-orange-200 bg-orange-50">
        <span className="absolute left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-red-500/90" />
        <span className="absolute right-[10px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-amber-400/95" />
      </div>
    );
  }

  if (brand === "amex") {
    return (
      <div className="flex h-5 w-8 items-center justify-center rounded border border-cyan-200 bg-cyan-100 px-1">
        <span className="text-[11px] font-extrabold tracking-tight text-cyan-800">
          AMEX
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-5 w-8 items-center justify-center rounded border border-orange-200 bg-white px-1">
      <span className="text-[9px] font-bold tracking-tight text-slate-700">
        Discover
      </span>
    </div>
  );
}
