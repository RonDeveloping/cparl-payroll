"use client";
// components/dashboard/profile-inline-editor.tsx

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Save } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { dashboardContent } from "@/constants/content";
import { SmartFormProvider } from "@/components/form/form-change-context";
import { upsertContactPEA } from "@/lib/actions/contact";
import { requestLoginEmailChange } from "@/lib/actions/login-email-change";
import {
  contactSchema,
  type ContactFormInput,
} from "@/lib/validations/contact-schema";
import { registerWithOnBlurFormat } from "@/utils/formRegister";
import formatPhone from "@/utils/formatters/phone";
import formatPostalCode from "@/utils/formatters/postalCode";
import { ChangeEntry, DirtyField, getFieldChanges } from "@/utils/formChanges";
import { getPostalLocationSuggestion } from "@/utils/validators/postalCodeLookup";

export default function ProfileInlineEditor({
  contactId,
  formId,
  initialData,
  showChanges,
  onEyeToggle,
  onChangeCount,
  onCancel,
  onSaved,
}: {
  contactId: string;
  formId: string;
  initialData: ContactFormInput;
  showChanges: boolean;
  onEyeToggle: () => void;
  onChangeCount: (count: number) => void;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [showOptionalIdentity, setShowOptionalIdentity] = useState(false);
  const [showOptionalContact, setShowOptionalContact] = useState(false);
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const [emailActionHint, setEmailActionHint] = useState<string | undefined>(
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    getValues,
    setValue,
    reset,
  } = useForm<ContactFormInput>({
    defaultValues: initialData,
    shouldFocusError: false,
    mode: "onBlur",
  });
  const currentValues = getValues();
  const changes: ChangeEntry<unknown>[] = useMemo(
    () =>
      getFieldChanges(
        initialData,
        currentValues,
        dirtyFields as unknown as Record<string, DirtyField>,
      ),
    [initialData, currentValues, dirtyFields],
  );
  const changeCount = changes.length;

  const applyPostalCodeSuggestion = () => {
    const suggestion = getPostalLocationSuggestion(getValues("postalCode"));
    if (!suggestion) return;

    if (suggestion.provinceCode) {
      const currentProvince = (getValues("province") || "")
        .trim()
        .toUpperCase();
      if (currentProvince !== suggestion.provinceCode) {
        setValue("province", suggestion.provinceCode, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }

    if (suggestion.city) {
      const currentCity = (getValues("city") || "").trim();
      if (currentCity.toLowerCase() !== suggestion.city.toLowerCase()) {
        setValue("city", suggestion.city, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  };

  const handlePostalCodeChange = () => {
    applyPostalCodeSuggestion();
  };

  const handlePostalCodeBlur = () => {
    applyPostalCodeSuggestion();
  };

  useEffect(() => {
    onChangeCount(changeCount);
  }, [changeCount, onChangeCount]);

  const registerFormatted = useMemo(
    () =>
      registerWithOnBlurFormat<ContactFormInput>(register, {
        postalCode: formatPostalCode,
        phone: formatPhone,
      }),
    [register],
  );

  const saveProfileChanges = async (data: ContactFormInput) => {
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message || "Please check your input.",
      );
      return false;
    }

    const result = await upsertContactPEA(parsed.data, contactId);
    if (!result.success) {
      toast.error(
        result.error || "Changes not saved; please check for errors.",
      );
      return false;
    }

    toast.success("Profile updated");
    setEmailActionHint(undefined);
    onSaved();
    return true;
  };

  const onSubmit = async (data: ContactFormInput) => {
    await saveProfileChanges(data);
  };

  const handleBeginEmailChange = () => {
    if (isDirty) {
      setEmailActionHint(
        dashboardContent.profileInlineEditor.unsavedChangesSaveHint,
      );
      return false;
    }

    setEmailActionHint(undefined);
    return true;
  };

  const handleRequestEmailChange = async (
    requestedEmail: string,
    currentPassword: string,
  ) => {
    if (!(await Promise.resolve(handleBeginEmailChange()))) return;

    if (!requestedEmail.trim() || !currentPassword) {
      toast.error("Please enter both new email and current password.");
      return;
    }

    setEmailActionHint(undefined);

    setIsRequestingEmailChange(true);
    const result = await requestLoginEmailChange(
      requestedEmail,
      currentPassword,
    );
    setIsRequestingEmailChange(false);

    if (!result.success) {
      toast.error(result.error || "Unable to request email change.");
      return;
    }

    toast.success(result.message || "Verification email sent.");
  };

  return (
    <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
      <SmartFormProvider<ContactFormInput>
        value={{
          changes,
          showChanges,
          register: registerFormatted,
        }}
      >
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.target instanceof HTMLTextAreaElement) return;
            if (e.target instanceof HTMLButtonElement) return;
            e.preventDefault();
          }}
          className="space-y-4"
        >
          <ContactForm
            errors={errors}
            showOptionalIdentity={showOptionalIdentity}
            setShowOptionalIdentity={setShowOptionalIdentity}
            showOptionalContact={showOptionalContact}
            setShowOptionalContact={setShowOptionalContact}
            onPostalCodeChange={handlePostalCodeChange}
            onPostalCodeBlur={handlePostalCodeBlur}
            hideCountryField
            readOnlyEmail
            emailChangeNote={
              dashboardContent.profileInlineEditor.loginEmailChangeNote
            }
            emailActionHint={emailActionHint}
            onBeginLoginEmailChange={handleBeginEmailChange}
            onRequestLoginEmailChange={handleRequestEmailChange}
            isRequestingEmailChange={isRequestingEmailChange}
          />
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <button
              type="button"
              onClick={() => {
                reset(initialData);
                setEmailActionHint(undefined);
                onCancel();
              }}
              className="inline-flex h-8 min-w-[88px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <button
                type="button"
                onClick={onEyeToggle}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                aria-pressed={showChanges}
                aria-label={showChanges ? "Hide changes" : "Show changes"}
                title={showChanges ? "Hide changes" : "Show changes"}
              >
                {showChanges ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <span>
                {changeCount} change{changeCount === 1 ? "" : "s"}
              </span>
            </div>
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="inline-flex h-8 min-w-[88px] items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-100 px-3 text-emerald-800 shadow-sm transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="text-emerald-700" size={16} />
              <span className="text-xs font-semibold text-emerald-800">
                {isSubmitting ? "Saving..." : "Save"}
              </span>
            </button>
          </div>
        </form>
      </SmartFormProvider>
    </div>
  );
}
