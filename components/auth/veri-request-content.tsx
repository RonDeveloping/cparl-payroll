//app/components/auth/veri-request-content.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { resendVerification } from "@/lib/actions/veri-actions";
// import { ROUTES } from "@/constants/routes";
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
        // generic for security and reflect the deactivation logic
        toast.success(
          "New link sent if the account exists; previous links, if any, are now invalid.",
        );
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
          Please check the inbox of <strong>{email}</strong> and click the link
          in the email to verify the email address and activate new account. If
          this address is already associated with an existing account, the
          message may instead include instructions to reset the password for
          that account.
        </p>
        <p className="text-slate-600 mb-6">
          Please keep this page open until the email arrives, in case you need
          to resend it.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive an email? Check your spam folder or
          </p>
          <button
            onClick={handleResend}
            disabled={isPending || countdown > 0}
            className="text-blue-600 font-medium hover:underline disabled:text-slate-400 disabled:no-underline flex items-center justify-center w-full gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${countdown}s`
                : "Click here to resend"}
          </button>
          {/* --- DEACTIVATION WARNING BOX --- */}
          <div className="mb-6 flex items-start gap-3 p-4 text-left bg-amber-50 border border-amber-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Security Note:</strong> Since resending a new link will
              instantly deactivate previous verification link, always use the{" "}
              <strong>most recent</strong> email in your inbox to verify your
              account.
            </p>
          </div>
          {/* -------------------------------- */}
        </div>

        <hr className="my-8 border-slate-100" />

        <Link
          href="/auth/login"
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          &larr; Back to login
        </Link>
      </div>

      {/* <Link
        href={`${ROUTES.AUTH.RESEND}?email=${encodeURIComponent(email || "")}`}
        className="text-blue-600 font-medium hover:underline"
      >
        click here to resend
      </Link> */}
    </div>
  );
}
