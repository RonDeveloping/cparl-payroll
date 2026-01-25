// lib/validators/postalCode.ts

// Letters not allowed anywhere: D, F, I, O, Q, U
// First letter: ABCEGHJ-NPRSTVXY
// Other letters in postal code: ABCEGHJ-NPRSTV-Z
export const canadianPostalCodeRegex =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export function isValidCanadianPostalCode(code: string) {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return canadianPostalCodeRegex.test(trimmed);
}
