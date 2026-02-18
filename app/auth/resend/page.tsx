//
"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/actions/veri-email";
import { toast } from "sonner"; // or your preferred toast lib
import { authStyles } from "@/constants/styles";

export default function ResendPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await resendVerificationEmail(email);

    if (result.success) {
      toast.success("If an account exists, a new link has been sent.");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={authStyles.resendContainer}>
      <form onSubmit={handleResend} className={authStyles.resendForm}>
        <h1 className={authStyles.resendTitle}>Resend Verification</h1>
        <p className={authStyles.resendDescription}>
          Enter your email to receive a new activation link.
        </p>
        <input
          type="email"
          required
          className={authStyles.resendInput}
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className={authStyles.resendButton}
        >
          {loading ? "Sending..." : "Send Link"}
        </button>
      </form>
    </div>
  );
}
