export const CANADA_PROVINCE_TERRITORY_CODES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
] as const;

export type CanadaProvinceTerritoryCode =
  (typeof CANADA_PROVINCE_TERRITORY_CODES)[number];

const CANADA_PROVINCE_TERRITORY_LABELS: Record<
  CanadaProvinceTerritoryCode,
  string
> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

export const CANADA_PROVINCE_TERRITORY_OPTIONS = [
  { label: "Select province or territory", value: "" },
  ...CANADA_PROVINCE_TERRITORY_CODES.map((code) => ({
    label: `${code} - ${CANADA_PROVINCE_TERRITORY_LABELS[code]}`,
    value: code,
  })),
] as const;
