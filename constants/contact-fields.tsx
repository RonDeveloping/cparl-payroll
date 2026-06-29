// constants/contact-fields.tsx
import { ContactFormInput } from "@/lib/validations/contact-schema";
import { Clarification } from "@/components/clarification";
import { ReactNode } from "react";
import { contactFieldContent, employeeFieldContent } from "@/constants/content";

export type FieldDef = {
  label: ReactNode;
  name: keyof ContactFormInput;
};

export const IDENTITY_FIELDS = {
  mandatory: [
    { label: "Given name", name: "givenName" },
    { label: "Family name", name: "familyName" },
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
    {
      label: (
        <Clarification
          term={employeeFieldContent.nickname.term}
          description={employeeFieldContent.nickname.description}
        />
      ),
      name: "nickName",
    },
    {
      label: (
        <Clarification
          term={employeeFieldContent.prefix.term}
          description={employeeFieldContent.prefix.description}
        />
      ),
      name: "prefix",
    },
    {
      label: (
        <Clarification
          term={employeeFieldContent.suffix.term}
          description={employeeFieldContent.suffix.description}
        />
      ),
      name: "suffix",
    },
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
    { label: "Street address", name: "street" },
    { label: "City", name: "city" },
    { label: "Province", name: "province" },
    { label: "Country", name: "country" },
  ] as FieldDef[],
};
