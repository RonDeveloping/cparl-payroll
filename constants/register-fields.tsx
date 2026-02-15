import { RegisterInput } from "@/lib/validations/register-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";

export type FieldDef = {
  label: ReactNode;
  name: keyof RegisterInput;
  rules?: Record<string, unknown>;
  type?: string;
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
    },

    {
      label: (
        <Clarification
          term="Mobile Phone"
          description="Optional for now, but will be required once you enter data. It will be used as a backup method for account recovery and two-factor authentication (2FA)."
        />
      ),
      name: "phone",
    },

    {
      label: (
        <Clarification
          term="Password"
          description="Use 8+ characters with at least one uppercase, lowercase, number and symbol like !@#$%^&*."
        />
      ),
      name: "password",
      type: "password",
    },

    { label: "Re-type Password", name: "confirmPassword", type: "password" },
  ] as FieldDef[],
} as const;
