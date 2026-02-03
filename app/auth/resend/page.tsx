//
"use client";

import { useState } from "react";
import { resendVerification } from "@/lib/actions/veri-actions";
import { toast } from "sonner"; // or your preferred toast lib

export default function ResendPage() {
  const [email, setEmail] = useState("");
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
          placeholder="email@example.com"
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
