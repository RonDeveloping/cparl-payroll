import { earningCodeContent } from "@/constants/content";

export function getEarningCodeDescription(earningCode: {
  code: string;
  description: string;
}) {
  const defaultDescription =
    earningCodeContent[earningCode.code as keyof typeof earningCodeContent]
      ?.description;

  return defaultDescription ?? earningCode.description;
}
