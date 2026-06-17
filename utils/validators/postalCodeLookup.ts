// utils/validators/postalCodeLookup.ts
import { isValidCanadianPostalCode } from "@/utils/validators/postalCode";

export type PostalLocationSuggestion = {
  provinceCode?: string;
  city?: string;
};

const provinceByFirstLetter: Record<string, string> = {
  A: "NL",
  B: "NS",
  C: "PE",
  E: "NB",
  G: "QC",
  H: "QC",
  J: "QC",
  K: "ON",
  L: "ON",
  M: "ON",
  N: "ON",
  P: "ON",
  R: "MB",
  S: "SK",
  T: "AB",
  V: "BC",
  X: "NT",
  Y: "YT",
};

// Conservative city hints only for strong, common prefixes.
const cityByFsaPrefix2: Record<string, string> = {
  K1: "Ottawa",
  K2: "Ottawa",
  K4: "Ottawa",
  M1: "Toronto",
  M2: "Toronto",
  M3: "Toronto",
  M4: "Toronto",
  M5: "Toronto",
  M6: "Toronto",
  M7: "Toronto",
  M8: "Toronto",
  M9: "Toronto",
  H1: "Montreal",
  H2: "Montreal",
  H3: "Montreal",
  V5: "Vancouver",
  V6: "Vancouver",
};

export function getPostalLocationSuggestion(
  postalCode: string | null | undefined,
): PostalLocationSuggestion | null {
  if (!postalCode) return null;

  const normalized = postalCode.replace(/\s+/g, "").toUpperCase();
  if (!isValidCanadianPostalCode(normalized)) {
    return null;
  }

  const firstLetter = normalized.charAt(0);
  const fsaPrefix2 = normalized.slice(0, 2);

  return {
    provinceCode: provinceByFirstLetter[firstLetter],
    city: cityByFsaPrefix2[fsaPrefix2],
  };
}
