"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPapAccount, type SavedPapAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formActionsStyles } from "@/constants/styles";
import { ERRORS } from "@/constants/errors";
import {
  getInstitutionBadgeClass,
  getInstitutionShortName,
  isValidInstitutionCode,
} from "@/constants/financial-institutions";

type PapAccountFormValues = {
  institutionNumber: string;
  bankDetails: string;
};

const formatInstitutionInput = (value: string) =>
  value.replace(/\D/g, "").slice(0, 3);

const formatTransitAccountInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 17);
  const branch = digits.slice(0, 5);
  const account = digits.slice(5, 17);
  return [branch, account].filter(Boolean).join("-");
};

export default function PapAccountForm({
  compact = false,
  onSaved,
}: {
  compact?: boolean;
  onSaved: (account: SavedPapAccount) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutionError, setInstitutionError] = useState<string | null>(null);
  const [transitError, setTransitError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PapAccountFormValues>({
    institutionNumber: "",
    bankDetails: "",
  });
  const bankLabel = getInstitutionShortName(formValues.institutionNumber);
  const normalizedInstitution = formatInstitutionInput(
    formValues.institutionNumber,
  );
  const normalizedTransitAccount = formatTransitAccountInput(
    formValues.bankDetails,
  );
  const isInstitutionValid =
    normalizedInstitution.length === 3 &&
    isValidInstitutionCode(normalizedInstitution);
  const isTransitAccountValid = /^(\d{5})-(\d{7,12})$/.test(
    normalizedTransitAccount,
  );
  const isPapFormValid = isInstitutionValid && isTransitAccountValid;

  const validateInstitutionNumber = (value: string): string | null => {
    const institution = formatInstitutionInput(value);

    if (institution.length === 0) {
      setInstitutionError(null);
      return null;
    }

    if (institution.length !== 3) {
      const message = ERRORS.BANK_NUMBER_MUST_BE_3_DIGITS;
      setInstitutionError(message);
      return message;
    }

    if (!isValidInstitutionCode(institution)) {
      const message = ERRORS.INSTITUTION_INVALID_PER_CPA;
      setInstitutionError(message);
      return message;
    }

    setInstitutionError(null);
    return null;
  };

  const validateTransitAccount = (value: string): string | null => {
    const details = formatTransitAccountInput(value);

    if (details.length === 0) {
      setTransitError(null);
      return null;
    }

    if (!/^(\d{5})-(\d{7,12})$/.test(details)) {
      const message = ERRORS.TRANSIT_ACCOUNT_INVALID_FORMAT;
      setTransitError(message);
      return message;
    }

    setTransitError(null);
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const institution = formatInstitutionInput(formValues.institutionNumber);
    const details = formatTransitAccountInput(formValues.bankDetails);

    const institutionValidationError = validateInstitutionNumber(institution);
    if (institutionValidationError) {
      toast.error(institutionValidationError);
      return;
    }

    const transitValidationError = validateTransitAccount(details);
    if (transitValidationError) {
      toast.error(transitValidationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createPapAccount({
        institutionNumber: institution,
        bankDetails: details,
      });

      onSaved(response.account);
      setFormValues({
        institutionNumber: "",
        bankDetails: "",
      });
      toast.success("Bank account saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save bank account.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div
          className={cn(
            "flex items-center justify-between px-3 pt-3 pb-1",
            compact ? "gap-2" : "gap-3",
          )}
        >
          <div className="text-base font-semibold text-slate-700">
            New bank account
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isPapFormValid}
            className={cn(
              formActionsStyles.saveButtonBase,
              "px-4 py-1.5 text-sm",
              isSubmitting || !isPapFormValid
                ? formActionsStyles.saveLocked
                : formActionsStyles.saveActive,
            )}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="grid w-full grid-cols-[6rem_14rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold tracking-wide text-slate-600">
          <div className="text-center">Bank #</div>
          <div className="text-center">Transit #-Account #</div>
          <div className="pl-1 text-left">Status</div>
        </div>

        <div className="grid w-full grid-cols-[6rem_14rem_6rem] items-start gap-2 px-3 py-2">
          <div className="relative">
            <input
              aria-label="Bank number"
              value={formValues.institutionNumber}
              placeholder="123"
              inputMode="numeric"
              maxLength={3}
              onChange={(event) =>
                setFormValues((current) => {
                  const nextInstitution = formatInstitutionInput(
                    event.target.value,
                  );
                  if (institutionError && nextInstitution.length === 3) {
                    validateInstitutionNumber(nextInstitution);
                  }
                  return {
                    ...current,
                    institutionNumber: nextInstitution,
                  };
                })
              }
              onBlur={(event) => validateInstitutionNumber(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-14 text-sm placeholder:text-slate-400"
            />
            {bankLabel ? (
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-0 right-2 flex items-center text-[8px] font-medium uppercase tracking-[0.04em]",
                  getInstitutionBadgeClass(formValues.institutionNumber),
                )}
              >
                {bankLabel}
              </div>
            ) : null}
            {institutionError ? (
              <p className="mt-1 text-xs text-red-600">{institutionError}</p>
            ) : null}
          </div>

          <div>
            <input
              aria-label="Transit number and account number"
              value={formValues.bankDetails}
              placeholder="12345-1234567"
              inputMode="numeric"
              maxLength={18}
              onChange={(event) =>
                setFormValues((current) => {
                  const nextBankDetails = formatTransitAccountInput(
                    event.target.value,
                  );
                  if (transitError) {
                    validateTransitAccount(nextBankDetails);
                  }
                  return {
                    ...current,
                    bankDetails: nextBankDetails,
                  };
                })
              }
              onBlur={(event) => validateTransitAccount(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm placeholder:text-slate-400"
            />
            {transitError ? (
              <p className="mt-1 text-xs text-red-600">{transitError}</p>
            ) : null}
          </div>

          <div className="flex h-10 items-center justify-start pl-1">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Unverified
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
