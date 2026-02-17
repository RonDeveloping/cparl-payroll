//constants/password-fields.tsx

import { Clarification } from "@/components/clarification";
import { ResetPasswordInput } from "@/lib/validations/password-schema";
import { ReactNode } from "react";
import { RegisterOptions, FieldValues, Path } from "react-hook-form";

export type BaseFieldDef<T extends FieldValues> = {
  label: ReactNode;
  name: Path<T>;
  type?: string;
  rules?: RegisterOptions<T>;
};

//TODO: live checklist and strength meter.
export const PASSWORD_FIELDS: BaseFieldDef<ResetPasswordInput>[] = [
  {
    label: (
      <Clarification
        term="New Password"
        description="Use 8+ characters with at least one uppercase, lowercase, number and symbol like !@#$%^&*."
      />
    ),
    name: "password",
    type: "password",
    rules: { required: "Password is required" },
  },
  {
    label: "Re-Type New Password",
    name: "confirmPassword",
    type: "password",
    rules: { required: "Please confirm your password" },
  },
] as const;
