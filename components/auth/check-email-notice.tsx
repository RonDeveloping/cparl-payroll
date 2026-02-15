//app/components/auth/check-email-notice.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { MailCheck } from "lucide-react";
import { AuthButton } from "../shared/auth-button";
import { Alert } from "../shared/alert";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { authContent as c } from "@/constants/content";
import { authStyles as s } from "@/constants/styles";

import { resendVerification } from "@/lib/actions/veri-actions";
import { toast } from "sonner";

export default function CheckEmailNotice() {
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
      toast.error(c.errors.noEmail);
      return;
    }

    setIsPending(true);

    try {
      const result = await resendVerification(email);

      if (result.success) {
        // generic for security and reflect the deactivation logic
        toast.success(c.security.resendSuccessToast, {
          duration: 10000, // Make it stay longer since the text is long
        });
      } else {
        toast.error(result.error || c.errors.resendFail, {
          duration: 8000, // Make it stay longer since the text is long
        });
      }
    } catch (_error) {
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
        <p className={s.bodyText}>{c.verifyEmail.mainInstruction(email)}</p>

        {/* SECONDARY REMINDER */}
        <div className={s.reminderBox}>
          <p className={s.reminderText}>
            <strong>Note:</strong> {c.verifyEmail.secondaryNote}
            account, the email will instruct you to reset your password instead.
          </p>
        </div>
        <p className={s.instructionText}>{c.verifyEmail.keepOpenReminder}</p>

        <div className={s.troubleshootWrapper}>
          <p className={s.troubleshootText}>{c.verifyEmail.troubleshoot}</p>
          <AuthButton
            label="Click here to resend"
            isPending={isPending}
            countdown={countdown}
            onClick={handleResend}
          />
        </div>

        {/* --- DEACTIVATION WARNING --- */}
        <Alert
          variant="warning"
          title="Security Note"
          message={c.security.deactivationWarning}
        />

        <hr className={s.divider} />

        <Link href={ROUTES.AUTH.LOGIN} className={s.linkBack}>
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}
