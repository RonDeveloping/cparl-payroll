"use client";
// app/auth/verification-status/page.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authStyles } from "@/constants/styles";
import { authContent } from "@/constants/content";
import { requestPasswordSetupLinkAction } from "@/lib/actions/password-setup";
import { toast } from "sonner";

type StatusCategory = "expired" | "already-verified";

const RESEND_COOLDOWN_SECONDS = 60;

function getStatusCategory(value: string | null): StatusCategory | null {
  if (value === "expired" || value === "already-verified") {
    return value;
  }
  return null;
}

function appendEmailToMessage(
  rawMessage: string | null,
  email: string | null,
): string | null {
  if (!rawMessage) return null;
  if (!email || rawMessage.includes(email)) return rawMessage;
  return `${rawMessage} ${email}`;
}

function StatusCard({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={authStyles.verificationTopContainer}>
      <div className={authStyles.verificationCardWrapper}>
        <div className={authStyles.card}>
          <h1 className={authStyles.missingTokenTitle}>{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VerificationStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusCategory = getStatusCategory(searchParams.get("statusCategory"));
  const email = searchParams.get("email");
  const message = searchParams.get("message");
  const messageWithEmail = appendEmailToMessage(message, email);

  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingSetupLink, setIsSendingSetupLink] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      return;
    }

    setIsPending(true);
    try {
      const { resendVerificationEmail } =
        await import("@/lib/actions/veri-email");
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setSent(true);
      }
    } catch {
    } finally {
      setIsPending(false);
      setCountdown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleSendSetupLink = async () => {
    if (!email) return;

    setIsSendingSetupLink(true);

    try {
      const result = await requestPasswordSetupLinkAction(email);
      if (!result.success) {
        toast.error(result.error || "Unable to send setup link.");
        return;
      }

      toast.success("A setup link has been sent to your email.");
      router.push(
        `/auth/check-email?email=${encodeURIComponent(email)}&flow=setup-password`,
      );
    } finally {
      setIsSendingSetupLink(false);
    }
  };

  if (!statusCategory) {
    return (
      <div className={authStyles.verificationMissingTopContainer}>
        <h1 className={authStyles.missingTokenTitle}>Missing Status</h1>
        <p>No verification status provided.</p>
      </div>
    );
  }

  if (statusCategory === "expired") {
    const resendLabel = isPending
      ? "Sending..."
      : countdown > 0
        ? `Resend in ${countdown}s`
        : "Resend Verification Email";

    if (!sent) {
      return (
        <StatusCard
          title={`Verification link${email ? ` of "${email}"` : ""} has expired; please request a new one.`}
        >
          {messageWithEmail ? (
            <p className={authStyles.verificationMessageText}>
              {messageWithEmail}
            </p>
          ) : null}
          <div className="flex gap-4 justify-center mt-4">
            <button
              type="button"
              className={authStyles.buttonResend}
              style={{ minWidth: 220 }}
              onClick={handleResend}
              disabled={isPending || countdown > 0}
            >
              {resendLabel}
            </button>
          </div>
        </StatusCard>
      );
    }

    return (
      <StatusCard title="Check your email">
        <p>We have sent a new verification email to {email}.</p>
      </StatusCard>
    );
  }

  if (statusCategory === "already-verified") {
    const alreadyVerifiedText =
      !messageWithEmail && email
        ? authContent.verifyEmail.alreadyVerifiedByEmail(email)
        : authContent.verifyEmail.alreadyVerified;
    const loginHref = email
      ? `/auth/login?email=${encodeURIComponent(email)}`
      : "/auth/login";

    return (
      <StatusCard title={alreadyVerifiedText}>
        {messageWithEmail ? (
          <p className={authStyles.verificationMessageText}>
            {messageWithEmail}
          </p>
        ) : null}
        <p className={authStyles.verificationMessageText}>
          If you still need to finish setting up your account, send yourself a
          setup link instead of logging in right away.
        </p>
        <div className="flex gap-4 justify-center mt-4">
          {email ? (
            <button
              type="button"
              onClick={handleSendSetupLink}
              disabled={isSendingSetupLink}
              className={authStyles.buttonResend}
              style={{ minWidth: 220 }}
            >
              {isSendingSetupLink ? "Sending..." : "Send setup link"}
            </button>
          ) : null}
          <Link href={loginHref} className="text-blue-600 underline">
            Login
          </Link>
        </div>
      </StatusCard>
    );
  }

  return null;
}
