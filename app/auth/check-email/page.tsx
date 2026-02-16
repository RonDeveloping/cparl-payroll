// app/auth/check-email/page.tsx

"use client";

import { Suspense } from "react";
import CheckEmailNotice from "@/components/auth/check-email-notice";

export default function CheckEmailPage() {
  return (
    // The Suspense boundary MUST wrap the component using useSearchParams
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CheckEmailNotice />
    </Suspense>
  );
}
