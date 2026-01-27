// components/RegisterForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerUserAction, checkEmailAvailability } from "@/db/actions/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CreateAccount() {
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. State to track visibility
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const result = await registerUserAction(data);

    if (result?.error) {
      setServerError(result.error);
    } else {
      // Redirect or show success message
      window.location.replace("/login?registered=true");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{serverError}</div>
      )}

      <div>
        <input
          {...register("displayName")}
          placeholder="Given Name"
          className="border p-2 w-full"
        />
        {errors.displayName && (
          <p className="text-sm text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      {/* Email with Async Validation */}
      <div>
        <label>Email for login and password reset</label>
        <input
          {...register("email", {
            validate: async (value) =>
              (await checkEmailAvailability(value)) ||
              "This email is already taken",
          })}
          className="border p-2 w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="relative flex flex-col gap-1">
        <label>Password</label>
        <div className="relative group">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="border p-2 w-full"
          />

          {/* 3. The Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                   text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={2.25} />
            ) : (
              <Eye size={18} strokeWidth={2.25} />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field (Uses the same toggle) */}
      <div className="relative flex flex-col gap-1">
        <label>Confirm Password</label>
        <input
          {...register("confirmPassword")}
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="border p-2 w-full"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms and Conditions Checkbox */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          {...register("acceptTerms")}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm">
          I agree to the{" "}
          <a href="/terms" className="underline">
            Terms and Conditions
          </a>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
      )}

      <button
        disabled={isSubmitting}
        className="bg-blue-600 text-white p-2 rounded disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
}
/*
Most professional development teams (including those at Vercel, Google, and Airbnb) prefer kebab-case for files for three technical reasons:

Case Sensitivity Issues: macOS and Windows are often case-insensitive, but Linux (where your code is deployed/CI/CD) is case-sensitive. If you rename RegisterForm.tsx to registerform.tsx, git might not track the change on Windows, but your build will fail on Linux. Kebab-case avoids this entirely.

URL Consistency: In the Next.js app router, folders define your URLs. URLs are always lowercase (e.g., /user-settings). Using kebab-case across your entire src folder keeps your file system consistent with your routing.

Scanability: register-form.tsx is slightly easier to read in a dense file tree than RegisterForm.tsx, especially for people using screen readers or different IDE themes.
*/
