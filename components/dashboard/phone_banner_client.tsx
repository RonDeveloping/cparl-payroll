// components/dashboard/phone_veri_banner.tsx
"use client";
import { ShieldCheck } from "lucide-react";
import { VerifyPhoneButton } from "./verify_phone_button";
import formatPhone from "@/utils/formatters/phone";

export default function PhoneVerificationBanner({ phone }: { phone: string }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800">
            <strong>{formatPhone(phone)}</strong> has been added as your account
            recovery number. <VerifyPhoneButton /> to enable this and two-factor
            authentication (2FA).
          </p>
        </div>
      </div>
    </div>
  );
}
