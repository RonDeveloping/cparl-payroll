import { UserRegistrationInput } from "@/lib/validations/user-register-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";
import { checkEmailAvailability } from "@/db/actions/user";

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
          term="Mobile Phone"
          description="with messaging service as a backup verification method."
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
