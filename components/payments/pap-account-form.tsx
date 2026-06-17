"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPapAccount, type SavedPapAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formActionsStyles } from "@/constants/styles";

type PapAccountFormValues = {
  institutionNumber: string;
  bankDetails: string;
};

const formatInstitutionInput = (value: string) =>
  value.replace(/\D/g, "").slice(0, 3);

const formatTransitAccountInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 22);
  const branch = digits.slice(0, 5);
  const account = digits.slice(5, 22);
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
  const [formValues, setFormValues] = useState<PapAccountFormValues>({
    institutionNumber: "",
    bankDetails: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const institution = formatInstitutionInput(formValues.institutionNumber);
    const details = formatTransitAccountInput(formValues.bankDetails);
    const detailMatch = details.match(/^(\d{5})-(\d{5,17})$/);

    if (institution.length !== 3) {
      toast.error("Bank number must be 3 digits.");
      return;
    }

    if (!detailMatch) {
      toast.error("Transit and account must be in the format 12345-1234567.");
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
        <div className="grid w-full grid-cols-[6rem_14rem_6rem] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <div className="text-center">Bank#</div>
          <div className="text-center">Transit#-Account#</div>
          <div className="pl-1 text-left">Status</div>
        </div>

        <div className="grid w-full grid-cols-[6rem_14rem_6rem] items-start gap-2 px-3 py-2">
          <input
            aria-label="Bank number"
            value={formValues.institutionNumber}
            placeholder="123"
            inputMode="numeric"
            maxLength={3}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                institutionNumber: formatInstitutionInput(event.target.value),
              }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
          />

          <input
            aria-label="Transit number and account number"
            value={formValues.bankDetails}
            placeholder="12345-1234567"
            inputMode="numeric"
            maxLength={23}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                bankDetails: formatTransitAccountInput(event.target.value),
              }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm placeholder:text-slate-400"
          />

          <div className="flex h-10 items-center justify-start pl-1">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Unverified
            </span>
          </div>
        </div>
      </div>

      <div className={compact ? "flex justify-end" : "flex justify-start"}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            formActionsStyles.saveButtonBase,
            isSubmitting
              ? formActionsStyles.saveLocked
              : formActionsStyles.saveActive,
          )}
        >
          {isSubmitting ? "Saving..." : "Save account"}
        </button>
      </div>
    </form>
  );
}
