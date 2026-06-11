// utils/formatters/dob.ts
/**
 * Format Date of Birth as YYYY-MM-DD while typing.
 * Strips non-digits and inserts hyphens after year and month.
 */
function formatDob(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (!digits) return "";
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export default formatDob;
