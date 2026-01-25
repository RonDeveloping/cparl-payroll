// lib\formatters\postalCode.ts

function formatPostalCode(value: string) {
  const cleaned = value.replace(/\s+/g, "").toUpperCase();

  if (cleaned.length !== 6) return value;

  return cleaned.replace(/^(.{3})(.{3})$/, "$1 $2");
}
export default formatPostalCode;
