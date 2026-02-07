//
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const result = await resetPasswordAction(token, password);

    if (result.success) {
      toast.success("Password updated! Please log in.");
      router.push(ROUTES.AUTH.LOGIN);
    } else {
      toast.error(result.error || "Failed to reset password");
      setIsLoading(false);
    }
  }

  // If someone lands here without a token, show a warning
  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-red-600 font-medium">
          Invalid link. Please request a new password reset.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6 text-blue-600">
        <ShieldCheck size={28} />
        <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              required
              name="password"
              type="password"
              minLength={8}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              required
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
}
