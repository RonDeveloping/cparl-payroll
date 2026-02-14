"use client";

//just in case I want to keep resend link in a separate page.

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerification } from "@/lib/actions/veri-actions";
import { toast } from "sonner";

function ResendFormContent() {
  const searchParams = useSearchParams();
  // 1. Get the param first
  const emailParam = searchParams.get("email") || "";

  // 2. Initialize state with that param directly
  // No more useEffect needed!
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await resendVerification(email);

    if (result.success) {
      toast.success("If an account exists, a new link has been sent.");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleResend}
        className="max-w-sm w-full space-y-4 bg-white p-6 rounded-lg shadow-md border"
      >
        <h1 className="text-xl font-bold">Resend Verification</h1>
        <p className="text-sm text-gray-600">
          Enter your email to receive a new activation link.
        </p>
        <input
          type="email"
          required
          className="w-full p-2 border rounded"
          placeholder={email || "emai2l@example.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-blue-300"
        >
          {loading ? "Sending..." : "Send Link"}
        </button>
      </form>
    </div>
  );
}
