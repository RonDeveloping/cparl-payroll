// components/dashboard/phone_veri_banner.tsx
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function PhoneVerificationBanner({ phone }: { phone: string }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800">
            <strong>Secure your account:</strong> You have added{" "}
            <span>{phone}</span> as a recovery number. Verify it now to enable
            2FA and account recovery features.
          </p>
        </div>

        <Link
          href={ROUTES.DASHBOARD.SETTINGS} // Or a specific /verify-phone route
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Verify Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
