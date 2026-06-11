// utils/formatters/sin.ts
/**
 * Format a Social Insurance Number (SIN) as XXX-XXX-XXX
 * Strips non-digits and formats to max 9 digits with hyphens
 */
function formatSIN(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Limit to 9 digits
  const limitedDigits = digits.slice(0, 9);

  // Format as XXX-XXX-XXX
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else {
    return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
}

/**
 * Luhn algorithm validation for SIN
 * Canadian SINs must pass the Luhn check
 */
export function isValidSINLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 9) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export default formatSIN;
