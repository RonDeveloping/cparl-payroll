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
  formId?: string; // Important for buttons outside the <form> tag
}

export function FormActions({
  onBackClick,
  backHref,
  backLabel,
  saveLabel,
  savingLabel = "Saving...",
  isSubmitting,
  formId,
}: FormActionsProps) {
  const SaveButton = (
    <button
      type="submit"
      form={formId}
      disabled={isSubmitting}
      className="flex items-center gap-2 bg-slate-50 text-emerald-600 border border-slate-200 px-8 py-2 rounded-lg font-semibold hover:bg-white hover:border-emerald-200 transition-all disabled:opacity-50"
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
