// utils/formatters/businessNumber.ts
function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Limit to maximum 13 digits (9 base + 4 suffix)
  const limitedDigits = digits.slice(0, 13);
  const baseDigits = limitedDigits.slice(0, 9);
  const suffixDigits = limitedDigits.slice(9, 13);
  const baseDisplay = baseDigits.match(/.{1,3}/g)?.join("-") ?? baseDigits;

  // Always include RP after 9 digits (automatically appears after 9th digit is entered)
  if (baseDigits.length === 9) {
    // Pad suffix digits with zeros to always show at least 3 digits, but allow up to 4
    const paddedSuffix = suffixDigits.padEnd(3, "0");
    return `${baseDisplay} RP ${paddedSuffix}`;
  }

  return baseDisplay;
}

export type BusinessNumberParts = {
  bn9: string;
  programId: string;
  accountRef: string;
};

export function splitBusinessNumber(value: string): BusinessNumberParts | null {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length < 13) return null;

  const programIdMatch = value.match(/\b([A-Z]{2})\b/);
  const programId = programIdMatch ? programIdMatch[1] : "RP";

  const match =
    `${digits.slice(0, 9)} ${programId} ${digits.slice(9, 13)}`.match(
      /^(\d{9})\s+([A-Z]{2})\s+(\d{4})$/,
    );
  if (!match) return null;

  return {
    bn9: match[1],
    programId: match[2],
    accountRef: match[3],
  };
}

export function composeBusinessNumberFromParts(parts: {
  bn9?: string | null;
  programId?: string | null;
  accountRef?: string | null;
}): string | null {
  if (!parts.bn9 || !parts.programId || !parts.accountRef) {
    return null;
  }

  const bn9 = parts.bn9.replace(/\D/g, "").slice(0, 9);
  const programId = parts.programId.trim().toUpperCase().slice(0, 2);
  const accountRef = parts.accountRef.replace(/\D/g, "").slice(0, 4);

  if (bn9.length !== 9 || programId.length !== 2 || accountRef.length !== 4) {
    return null;
  }

  return `${bn9} ${programId} ${accountRef}`;
}

export default formatBusinessNumber;
