// components/dashboard/phone_banner_server.tsx
import { getPhoneStatus } from "@/lib/dal/user-status";
import PhoneVerificationBanner from "./phone_banner_client";

export default async function PhoneBannerServer() {
  const data = await getPhoneStatus();

  // Decide whether to show the banner
  if (!data?.phone || data.phoneVerifiedAt) return null;

  return <PhoneVerificationBanner phone={data.phone} />;
}
