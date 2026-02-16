// app/auth/check-phone/page.tsx

"use client";

import { Suspense } from "react";
import CheckPhoneNotice from "@/components/auth/check-phone-notice";

export default function CheckPhonePage() {
  return (
    // The Suspense boundary MUST wrap the component using useSearchParams
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CheckPhoneNotice />
    </Suspense>
  );
}
