import { UserRegistrationInput } from "@/lib/validations/register-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";
import { checkEmailAvailability } from "@/db/actions/auth";

export type FieldDef = {
  label: ReactNode;
  name: keyof UserRegistrationInput;
};

export const REGISTER_FIELDS = {
  mandatory: [
    { label: "Given Name", name: "givenName" },
    { label: "Family Name", name: "familyName" },

    {
      label: (
        <Clarification
          term="Email"
          description="for login and password recovery purposes."
        />
      ),
      name: "email",
      rules: {
        validate: async (value: string) =>
          (await checkEmailAvailability(value)) ||
          "This email is already taken",
      },
    },

    {
      label: (
        <Clarification
          term="Phone"
          description="mobile only with messaging as a backup verification method."
        />
      ),
      name: "phone",
    },

    {
      label: (
        <Clarification
          term="Password"
          description="8-12 characters, including uppercase, lowercase, number, and special character."
        />
      ),
      name: "password",
      type: "password",
    },

    { label: "Confirm Password", name: "confirmPassword", type: "password" },
  ] as FieldDef[],
} as const;

/*
<input
            {...register("email", {
              validate: async (value) =>
                (await checkEmailAvailability(value)) ||
                "This email is already taken",
            })}
            className="border p-2 w-full"
          />

        <div className="relative flex flex-col gap-1">
          <CapLabel>Password</CapLabel>
          <div className="relative group">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="border p-2 w-full"
            />

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
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="relative flex flex-col gap-1">
          <CapLabel>Confirm Password</CapLabel>
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
          */
