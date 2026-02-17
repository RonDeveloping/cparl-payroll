"use client";

import { useTransition } from "react";
import { sendPhoneVerification } from "@/lib/actions/veri-phone";

export function VerifyPhoneButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    startTransition(async () => {
      try {
        await sendPhoneVerification();
        // Optionally add a toast or success state here
      } catch (error) {
        console.error("Failed to send verification:", error);
      }
    });
  };

  return (
    <button
      className="inline underline font-semibold text-blue-600 decoration-blue-400 hover:text-blue-800"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Sending..." : "Verify it now"}
    </button>
  );
}
