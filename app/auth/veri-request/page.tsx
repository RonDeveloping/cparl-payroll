// app/auth/verify/page.tsx

"use client";

// import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Suspense } from "react";
import VerifyRequestContent from "@/components/auth/veri-request-content";

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    // The Suspense boundary MUST wrap the component using useSearchParams
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <VerifyRequestContent />
    </Suspense>
  );
}
