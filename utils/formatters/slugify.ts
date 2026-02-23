/**
 * Slugify utility function
 * Converts a string into a URL-friendly slug format
 */
export const slugify = (input: string): string => {
  if (!input) return "";

  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generate a random string of specified length (in hex)
 * @param length - number of hex characters (3 = 12-bit, 5 = 20-bit)
 */
const generateRandomId = (length: number): string => {
  const maxValue = Math.pow(16, length) - 1;
  const randomValue = Math.floor(Math.random() * (maxValue + 1));
  return randomValue.toString(16).padStart(length, "0");
};

/**
 * Generate tenant slug from coreName and kindName (legalNameEnding)
 * Always appends a random suffix for uniqueness:
 * - 5 characters for sole proprietors (no kindName)
 * - 3 characters when kindName is provided
 */
export const generateTenantSlug = (
  coreName: string,
  kindName?: string | null,
): string => {
  // Use 5-digit suffix for sole proprietors, 3-digit for organizations
  const suffix = kindName
    ? generateRandomId(3) // 3 chars (~4,096 combinations) for organizations
    : generateRandomId(5); // 5 chars (~1,048,576 combinations) for sole proprietors

  if (!kindName) {
    return `${slugify(coreName)}-${suffix}`;
  }

  const parts = [coreName, kindName].filter(Boolean);
  const combined = parts.join(" ");
  return `${slugify(combined)}-${suffix}`;
};

/**
 * Trim coreName if it ends with kindName (legalNameEnding)
 * Prevents duplication like "ACE Inc. Inc." -> "ACE Inc."
 */
export const trimDuplicateEnding = (
  coreName: string,
  kindName?: string | null,
): string => {
  if (!kindName) return coreName.trim();

  const lowerCoreName = coreName.toLowerCase().trim();
  const lowerKindName = kindName.toLowerCase().trim();

  // Check if coreName ends with kindName
  if (lowerCoreName.endsWith(lowerKindName)) {
    // Remove the kindName from the end and trim whitespace
    return coreName.substring(0, coreName.length - kindName.length).trim();
  }

  return coreName.trim();
};
