import { RegisterInput } from "@/lib/validations/register-schema";
import { Clarification } from "@/components/clarification";
import { BaseFieldDef, PASSWORD_FIELDS } from "./password-fields";

export type FieldDef = BaseFieldDef<RegisterInput>;

export const REGISTER_FIELDS = {
  mandatory: [
    { label: "Given Name", name: "givenName", rules: { required: true } },
    { label: "Family Name", name: "familyName", rules: { required: true } },
    {
      label: (
        <Clarification
          term="Email"
          description="for login and password recovery purposes."
        />
      ),
      name: "email",
      rules: { required: true },
    },
    {
      label: (
        <Clarification
          term="Mobile Phone"
          description="Optional for now, but will be used for backup and 2FA."
        />
      ),
      name: "phone",
    },
    // Use the spread operator to inject the two password fields here
    ...PASSWORD_FIELDS,
  ] as FieldDef[],
} as const;
