function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  // strip leading country code
  const normalized =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (normalized.length !== 10) return value;

  const [area, mid, last] = [
    normalized.slice(0, 3),
    normalized.slice(3, 6),
    normalized.slice(6),
  ];

  return `(${area}) ${mid}-${last}`;
}

export default formatPhone;
