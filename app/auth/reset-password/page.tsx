"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAction } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { ShieldCheck, Mail } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SmartFormProvider } from "@/components/form/form-change-context";
import InputWithChanges from "@/components/form/input-with-changes";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/validations/password-schema";
import { PASSWORD_FIELDS } from "@/constants/password-fields";
import { cn } from "@/lib/utils";
import { BUTTON_VARIANTS } from "@/constants/styles";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);

  // Setup React Hook Form
  const formMethods = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = formMethods;

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    setIsLoading(true);
    const result = await resetPasswordAction(token, data.password);

    if (result.success) {
      toast.success("Password updated! Please log in.");
      router.push(ROUTES.AUTH.LOGIN);
    } else {
      toast.error(result.error || "Failed to reset password");
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-red-600 font-medium">
          Invalid link. Please request a new reset.
        </p>
      </div>
    );
  }
  8;
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-2 text-blue-600">
        <ShieldCheck size={28} />
        <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
      </div>

      {email && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <Mail size={16} className="text-slate-400" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{email}</span>
          </p>
        </div>
      )}

      {/* Provide the context that InputWithChanges needs */}
      <SmartFormProvider
        value={{
          register: register,
          changes: [],
          showChanges: false,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {PASSWORD_FIELDS.map((field) => (
            <InputWithChanges<ResetPasswordInput>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}

          <button
            disabled={isLoading || !isValid}
            type="submit"
            className={cn(BUTTON_VARIANTS.primary, "relative w-full")}
          >
            {isLoading ? "Updating..." : "Submit"}
          </button>
        </form>
      </SmartFormProvider>
    </div>
  );
}
