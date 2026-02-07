// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { askForResetLinkAction } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = await askForResetLinkAction(email);

    if (result.success) {
      setIsSubmitted(true);
      toast.success("Reset link generated!");
    } else {
      toast.error(result.error || "Something went wrong");
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="text-slate-500 mt-2">
          If an account exists for that email, we have sent a password reset
          link.
        </p>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
      <p className="text-slate-500 mt-2 mb-6">
        Enter your email to receive a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <input
            required
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-sm text-slate-500 hover:text-blue-600"
        >
          Remember your password? Log in
        </Link>
      </div>
    </div>
  );
}
