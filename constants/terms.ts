// constants/terms.ts
export const CURRENT_TERMS_VERSION = "v1" as const;

export function hasAcceptedCurrentTerms(
  termsAcceptedAt: Date | null | undefined,
  termsVersionAccepted: string | null | undefined,
): boolean {
  return Boolean(
    termsAcceptedAt && termsVersionAccepted === CURRENT_TERMS_VERSION,
  );
}
