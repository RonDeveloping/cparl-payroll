// utils/formatters/id.ts
export const normalizeId = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "");
};
