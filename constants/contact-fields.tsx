// constants/contact-fields.tsx
import { ContactFormInput } from "@/lib/validations/contact-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";
import { contactFieldContent } from "@/constants/content";

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
          term={contactFieldContent.middleName.term}
          description={contactFieldContent.middleName.description}
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
          term={contactFieldContent.displayName.term}
          description={contactFieldContent.displayName.description}
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
          term={contactFieldContent.postalCode.term}
          description={contactFieldContent.postalCode.description}
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
