"use client";
// components/contact/contact-form.tsx

import { useState } from "react";
import { FieldErrors } from "react-hook-form";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import FormSection from "@/components/form/form-section";
import InputWithChanges from "@/components/form/input-with-changes";
import SectionDisclosure from "@/components/section-disclosure";
import { Clarification } from "@/components/clarification";
import { dashboardContent } from "@/constants/content";
import { IDENTITY_FIELDS, CONTACT_FIELDS } from "@/constants/contact-fields";
import { FormGrid } from "../form/form-grid";
import {
  getPostalCodeProgress,
  type PostalCodeProgressTone,
} from "@/utils/validators/postalCodeProgress";

interface ContactFormProps {
  errors: FieldErrors<ContactFormInput>;
  showOptionalIdentity: boolean;
  setShowOptionalIdentity: (
    val: boolean | ((prev: boolean) => boolean),
  ) => void;
  showOptionalContact: boolean;
  setShowOptionalContact: (val: boolean | ((prev: boolean) => boolean)) => void;
  onPostalCodeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  hideCountryField?: boolean;
  readOnlyEmail?: boolean;
  emailChangeNote?: string;
  emailActionHint?: string;
  onBeginLoginEmailChange?: () => Promise<boolean> | boolean;
  onRequestLoginEmailChange?: (
    requestedEmail: string,
    currentPassword: string,
  ) => Promise<void> | void;
  isRequestingEmailChange?: boolean;
}

export function ContactForm({
  errors,
  showOptionalIdentity,
  setShowOptionalIdentity,
  showOptionalContact,
  setShowOptionalContact,
  onPostalCodeChange,
  onPostalCodeBlur,
  hideCountryField = false,
  readOnlyEmail = false,
  emailChangeNote,
  emailActionHint,
  onBeginLoginEmailChange,
  onRequestLoginEmailChange,
  isRequestingEmailChange = false,
}: ContactFormProps) {
  const [postalProgress, setPostalProgress] = useState<{
    text: string;
    tone: PostalCodeProgressTone;
  }>({
    text: "",
    tone: "neutral",
  });
  const [showEmailChangeInputs, setShowEmailChangeInputs] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const submitEmailChangeInline = async () => {
    if (!onRequestLoginEmailChange) return;
    if (!requestedEmail.trim() || !currentPassword) return;

    await onRequestLoginEmailChange(requestedEmail.trim(), currentPassword);
    setCurrentPassword("");
  };

  const handleEmailChangeKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    e.stopPropagation();
    await submitEmailChangeInline();
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeChange?.(e);
  };

  const handlePostalCodeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setPostalProgress(getPostalCodeProgress(e.target.value || ""));
    onPostalCodeBlur?.(e);
  };

  return (
    <>
      {/* Identity Section */}
      <FormSection title="Identity">
        <FormGrid>
          {IDENTITY_FIELDS.mandatory.map((field) => (
            <InputWithChanges<ContactFormInput>
              key={field.name}
              {...field}
              error={errors[field.name]?.message}
            />
          ))}
        </FormGrid>

        <SectionDisclosure
          label="Optional"
          expanded={showOptionalIdentity}
          onToggle={() => setShowOptionalIdentity((v) => !v)}
        />

        <div
          inert={!showOptionalIdentity}
          aria-hidden={!showOptionalIdentity} //remove from accessibility tree when hidden
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out
          ${showOptionalIdentity ? "max-h-[400px] p-1 opacity-100" : "max-h-0 p-0 opacity-0"}`}
        >
          <FormGrid>
            {IDENTITY_FIELDS.optional.map((field) => (
              <InputWithChanges<ContactFormInput>
                key={field.name}
                {...field}
                error={errors[field.name]?.message}
              />
            ))}
          </FormGrid>
        </div>
      </FormSection>

      {/* Contact Section */}
      <FormSection title="Contact">
        <FormGrid>
          {CONTACT_FIELDS.mandatory.map((field) => {
            const isPostalCodeField = field.name === "postalCode";
            const isEmailField = field.name === "email";

            return (
              <div key={field.name} className="space-y-1">
                <InputWithChanges<ContactFormInput>
                  {...field}
                  label={
                    isEmailField && readOnlyEmail ? (
                      <Clarification
                        term="Email"
                        description={
                          emailChangeNote ||
                          "Login email changes require a verification procedure. Use 'Change login email' to send a confirmation link to the new address."
                        }
                      />
                    ) : (
                      field.label
                    )
                  }
                  error={errors[field.name]?.message}
                  readOnly={isEmailField && readOnlyEmail}
                  inputClassName={
                    isEmailField && readOnlyEmail ? "pr-20" : undefined
                  }
                  fieldAction={
                    isEmailField &&
                    readOnlyEmail &&
                    onRequestLoginEmailChange ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (onBeginLoginEmailChange) {
                            const canStart = await onBeginLoginEmailChange();
                            if (!canStart) return;
                          }
                          setShowEmailChangeInputs((prev) => !prev);
                        }}
                        disabled={isRequestingEmailChange}
                        className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 transition hover:bg-blue-100"
                        aria-label={
                          dashboardContent.profileInlineEditor
                            .loginEmailToggleButton
                        }
                        title={
                          dashboardContent.profileInlineEditor
                            .loginEmailToggleButton
                        }
                      >
                        {isRequestingEmailChange
                          ? dashboardContent.profileInlineEditor
                              .loginEmailSubmittingLabel
                          : dashboardContent.profileInlineEditor
                              .loginEmailToggleButton}
                      </button>
                    ) : undefined
                  }
                  onChange={
                    isPostalCodeField ? handlePostalCodeChange : undefined
                  }
                  onBlur={isPostalCodeField ? handlePostalCodeBlur : undefined}
                />
                {isEmailField && readOnlyEmail && emailActionHint && (
                  <p className="text-xs font-medium text-blue-700 underline underline-offset-2">
                    {emailActionHint}
                  </p>
                )}
                {isEmailField && readOnlyEmail && showEmailChangeInputs && (
                  <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/60 p-2">
                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          {
                            dashboardContent.profileInlineEditor
                              .loginEmailNewFieldLabel
                          }
                        </label>
                        <input
                          type="email"
                          value={requestedEmail}
                          onChange={(e) => setRequestedEmail(e.target.value)}
                          onKeyDown={handleEmailChangeKeyDown}
                          disabled={isRequestingEmailChange}
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring"
                          placeholder={
                            dashboardContent.profileInlineEditor
                              .loginEmailNewFieldPlaceholder
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                          {
                            dashboardContent.profileInlineEditor
                              .loginEmailPasswordFieldLabel
                          }
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          onKeyDown={handleEmailChangeKeyDown}
                          disabled={isRequestingEmailChange}
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring"
                          placeholder={
                            dashboardContent.profileInlineEditor
                              .loginEmailPasswordFieldPlaceholder
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            isRequestingEmailChange ||
                            !requestedEmail.trim() ||
                            !currentPassword
                          }
                          onClick={submitEmailChangeInline}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {
                            dashboardContent.profileInlineEditor
                              .loginEmailSubmitButton
                          }
                        </button>
                        <button
                          type="button"
                          disabled={isRequestingEmailChange}
                          onClick={() => {
                            setShowEmailChangeInputs(false);
                            setCurrentPassword("");
                          }}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          {
                            dashboardContent.profileInlineEditor
                              .loginEmailCancelButton
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {isPostalCodeField && postalProgress.text && (
                  <p
                    className={`text-xs ${
                      postalProgress.tone === "error"
                        ? "text-red-600"
                        : postalProgress.tone === "warning"
                          ? "text-amber-600"
                          : postalProgress.tone === "success"
                            ? "text-emerald-700"
                            : "text-slate-500"
                    }`}
                  >
                    {postalProgress.text}
                  </p>
                )}
              </div>
            );
          })}
        </FormGrid>
        <SectionDisclosure
          label="Optional"
          expanded={showOptionalContact}
          onToggle={() => setShowOptionalContact((v) => !v)}
        />
        <div
          inert={!showOptionalContact}
          aria-hidden={!showOptionalContact} //remove from accessibility tree when hidden
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out
          ${showOptionalContact ? "max-h-[400px] p-1 opacity-100" : "max-h-0 p-0 opacity-0"}`}
        >
          <FormGrid>
            {CONTACT_FIELDS.optional
              .filter(
                (field) => !(hideCountryField && field.name === "country"),
              )
              .map((field) => (
                <InputWithChanges<ContactFormInput>
                  key={field.name}
                  {...field}
                  error={errors[field.name]?.message}
                />
              ))}
          </FormGrid>
        </div>
      </FormSection>
    </>
  );
}
