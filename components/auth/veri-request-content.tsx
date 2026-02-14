//app/components/auth/veri-request-content.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { resendVerification } from "@/lib/actions/veri-actions";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isPending, setIsPending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle the 60-second timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  const handleResend = async () => {
    if (!email) {
      toast.error("No email address found to resend to.");
      return;
    }

    setIsPending(true);

    try {
      const result = await resendVerification(email);

      if (result.success) {
        // We keep the message generic for security
        toast.success("A new link has been sent if the account exists.");
      } else {
        toast.error(result.error || "Failed to resend email.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
      setCountdown(60); // Start the 60-second countdown
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <MailCheck className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Check your email
          </h1>
          <p className="text-slate-600 mb-6">
            We&apos;ve sent an email to <strong>{email}</strong>. Please click a
            link in the email to verify the email address and activate your
            account. The email might contain an instruction to reset your
            password instead if that email address has already been registered.
            Please keep the page open till you receive the email to use the
            resend option below if needed.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive an email? Check your spam folder or
            </p>
            <button
              onClick={handleResend}
              disabled={isPending || countdown > 0}
              className="text-blue-600 font-medium hover:underline"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending
                ? "Sending..."
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Click here to resend"}
            </button>
          </div>

          <hr className="my-8 border-slate-100" />

          <Link
            href="/auth/login"
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
      <Link
        href={`${ROUTES.AUTH.RESEND}?email=${encodeURIComponent(email || "")}`}
        className="text-blue-600 font-medium hover:underline"
      >
        click here to resend
      </Link>
      {/* ... rest of JSX ... */}
    </div>
  );
}
