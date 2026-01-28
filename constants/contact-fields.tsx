import { ContactFormInput } from "@/lib/validations/contact-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";

export type FieldDef = {
  label: ReactNode;
  name: keyof ContactFormInput;
};

export const IDENTITY_FIELDS = {
  mandatory: [
    { label: "Given Name", name: "givenName" },
    { label: "Family Name", name: "familyName" },
  ] as FieldDef[],
  optional: [
    {
      label: (
        <Clarification
          term="Middle Name"
          description="Beneficial for more complete identification..."
        />
      ),
      name: "middleName",
    },
    { label: "Nickname", name: "nickName" },
    { label: "Prefix", name: "prefix" },
    { label: "Suffix", name: "suffix" },
    {
      label: (
        <Clarification
          term="Customized Display Name"
          description="Override the default 'Prefix + Given + Middle + Family' format here."
        />
      ),
      name: "displayName",
    },
  ] as FieldDef[],
} as const;

export const CONTACT_FIELDS = {
  mandatory: [
    { label: "Email", name: "email" },
    {
      label: (
        <Clarification
          term="Postal Code"
          description="Communication may be tailored based on your region."
        />
      ),
      name: "postalCode",
    },
  ] as FieldDef[],

  optional: [
    { label: "Phone", name: "phone" },
    { label: "Street Address", name: "street" },
    { label: "City", name: "city" },
    { label: "Province", name: "province" },
    { label: "Country", name: "country" },
  ] as FieldDef[],
};
