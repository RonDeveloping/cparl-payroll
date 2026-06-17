"use client";
// components/auth/check-email-notice.tsx

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { MailCheck } from "lucide-react";
import { AuthButton } from "../shared/auth-button";
import { Alert } from "../shared/alert";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { authContent as c } from "@/constants/content";
import { authStyles as s } from "@/constants/styles";

import { resendVerificationEmail } from "@/lib/actions/veri-email";
import { requestPasswordSetupLinkAction } from "@/lib/actions/password-setup";
import { toast } from "sonner";

type EmailFlow = "verification" | "setup-password";

function getEmailFlow(value: string | null): EmailFlow {
  return value === "setup-password" ? "setup-password" : "verification";
}

export default function CheckEmailNotice() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const flow = getEmailFlow(searchParams.get("flow"));
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
      toast.error(c.errors.noEmail);
      return;
    }

    setIsPending(true);

    try {
      const result =
        flow === "setup-password"
          ? await requestPasswordSetupLinkAction(email)
          : await resendVerificationEmail(email);

      if (result.success) {
        toast.success(
          flow === "setup-password"
            ? "A new setup link has been sent to your email."
            : c.security.resendSuccessToast,
          {
            duration: 10000, // Make it stay longer since the text is long
          },
        );
      } else {
        toast.error(result.error || c.errors.resendFail, {
          duration: 8000, // Make it stay longer since the text is long
        });
      }
    } catch {
      toast.error(c.errors.generic, {
        duration: 8000, // Make it stay longer since the text is long
      });
    } finally {
      setIsPending(false);
      setCountdown(60); // Start the 60-second countdown
    }
  };

  return (
    <div className={s.pageWrapper}>
      <div className={s.card}>
        <div className={s.iconCenter}>
          <div className={s.iconWrapper}>
            <MailCheck className={s.iconMain} />
          </div>
        </div>

        <h1 className={s.title}>{c.verifyEmail.title}</h1>
        {/* MAIN INSTRUCTION */}
        <p
          className={s.bodyText}
          dangerouslySetInnerHTML={{
            __html:
              flow === "setup-password"
                ? `Please click the setup link in the email we sent to <strong>${email}</strong>.`
                : c.verifyEmail.mainInstruction(email),
          }}
        />

        {/* SECONDARY REMINDER */}
        <div className="mb-6 p-3 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong>{" "}
            {flow === "setup-password"
              ? "If the email doesn\'t arrive soon, check your spam folder or resend the setup link below."
              : c.verifyEmail.secondaryNote}
          </p>
        </div>
        <p className={s.instructionText}>
          {flow === "setup-password"
            ? "Keep this page open while you check for the setup link."
            : "Keep this page open while you check your inbox. If you do not receive it soon, resend below."}
        </p>

        <div className="flex items-center w-full gap-4 mb-6">
          <Link
            href={`${ROUTES.AUTH.LOGIN}${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className={s.linkBack + " mr-4 min-w-max"}
          >
            &larr; Login
          </Link>
          <div className="flex-1 flex flex-col gap-2">
            <AuthButton
              label={
                flow === "setup-password"
                  ? "Resend setup link"
                  : "Resend verification email"
              }
              isPending={isPending}
              countdown={countdown}
              onClick={handleResend}
            />
            <Alert
              variant="warning"
              message={
                flow === "setup-password"
                  ? "Resending a setup link invalidates the previous one for security."
                  : c.security.deactivationWarning
              }
            />
          </div>
        </div>
        <hr className={s.divider} />
      </div>
    </div>
  );
}
