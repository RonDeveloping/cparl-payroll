"use client";
// app/auth/confirm-email-change/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

type Status = "loading" | "success" | "error";

export default function ConfirmEmailChangePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your email change...");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This link is invalid or broken.");
      return;
    }

    fetch(`/api/confirm-email-change?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Unable to confirm email change.");
        }
        return data as { email?: string };
      })
      .then((data) => {
        setEmail(data.email || "");
        setStatus("success");
        setMessage("Your login email has been updated successfully.");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm email change.",
        );
      });
  }, [token]);

  const loginHref = email
    ? `${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(email)}`
    : ROUTES.AUTH.LOGIN;

  return (
    <div className={authStyles.verificationTopContainer}>
      <div className={authStyles.verificationCardWrapper}>
        <div className={authStyles.card}>
          <h1 className={authStyles.missingTokenTitle}>
            {status === "loading"
              ? "Confirming Email Change"
              : status === "success"
                ? "Email Updated"
                : "Email Change Failed"}
          </h1>
          <p className={authStyles.verificationMessageText}>{message}</p>
          <div className="mt-4 flex justify-center">
            <Link href={loginHref} className="text-blue-600 underline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
