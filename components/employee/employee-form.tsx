"use client";

import { FieldErrors } from "react-hook-form";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import CustomDatePickerWithChanges from "@/components/form/custom-date-picker-with-changes";
import { FormGrid } from "@/components/form/form-grid";
import { Clarification } from "@/components/clarification";
import formatSIN from "@/utils/formatters/sin";

interface EmployeeFormProps {
  errors: FieldErrors<ContactFormInput>;
}

export function EmployeeForm({ errors }: EmployeeFormProps) {
  const today = new Date();
  const maxDob = today.toISOString().slice(0, 10);
  const minDobDate = new Date(today);
  minDobDate.setFullYear(today.getFullYear() - 150);
  const minDob = minDobDate.toISOString().slice(0, 10);

  return (
    <>
      <FormSection title="Identification">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Given Name"
            name="givenName"
            rules={{ required: "Given name is required" }}
            error={errors.givenName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Family Name"
            name="familyName"
            rules={{ required: "Family name is required" }}
            error={errors.familyName?.message}
          />
          <InputWithChanges<ContactFormInput>
            label={
              <Clarification
                term="SIN"
                description="Social Insurance Number (9 digits, formatted as XXX-XXX-XXX)."
              />
            }
            name="sin"
            type="text"
            placeholder="123-456-789"
            maxLength={11}
            formatOnChange={formatSIN}
            rules={{}}
            error={errors.sin?.message}
          />
          <CustomDatePickerWithChanges<ContactFormInput>
            label="Date of Birth"
            name="dob"
            minDate={minDob}
            maxDate={maxDob}
            error={errors.dob?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Contact">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Email"
            name="email"
            type="email"
            rules={{ required: "Email is required" }}
            error={errors.email?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Phone"
            name="phone"
            type="tel"
            rules={{}}
            error={errors.phone?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address">
        <FormGrid>
          <InputWithChanges<ContactFormInput>
            label="Street"
            name="street"
            rules={{}}
            error={errors.street?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="City"
            name="city"
            rules={{}}
            error={errors.city?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Province"
            name="province"
            rules={{}}
            error={errors.province?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Postal Code"
            name="postalCode"
            rules={{}}
            error={errors.postalCode?.message}
          />
          <InputWithChanges<ContactFormInput>
            label="Country"
            name="country"
            rules={{}}
            error={errors.country?.message}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}
