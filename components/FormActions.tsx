//@components\FormActions.tsx
"use client";

import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormActionsProps {
  onBackClick?: () => void;
  backHref?: string;
  backLabel: string;
  saveLabel: string;
  savingLabel?: string;
  isSubmitting: boolean;
  isDisabled: boolean;
  formId?: string; // Important for buttons outside the <form> tag
}

export function FormActions({
  onBackClick,
  backHref,
  backLabel,
  saveLabel,
  savingLabel = "Saving...",
  isSubmitting,
  isDisabled,
  formId,
}: FormActionsProps) {
  const SaveButton = (
    <button
      type="submit"
      form={formId}
      disabled={isDisabled || isSubmitting}
      className={`flex items-center gap-2 border px-8 py-2 rounded-lg font-semibold transition-all
      ${
        isDisabled || isSubmitting
          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          : "bg-slate-50 text-emerald-600 border-slate-200 hover:bg-white hover:border-emerald-200 active:scale-95 shadow-sm"
      }`}
    >
      {isSubmitting ? (
        savingLabel
      ) : (
        <>
          <Save size={18} />
          {saveLabel}
        </>
      )}
    </button>
  );
  //opacity-50
  return (
    <div className="flex justify-between items-center w-full">
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} className="mr-1" /> {backLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBackClick}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} className="mr-1" /> {backLabel}
        </button>
      )}

      {SaveButton}
    </div>
  );
}
