//@components\FormActions.tsx
"use client";

import { Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface FormActionsProps {
  /** navigation */
  onBackClick?: () => void;
  backHref?: string;
  backLabel: string;

  /** save */
  saveLabel: string;
  savingLabel?: string;
  isSubmitting: boolean;
  isDisabled: boolean;
  formId?: string; // Important for buttons outside the <form> tag to link to the form

  /** change disclosure & toggle to show */
  changeLabel?: string;
  showB4Change?: boolean;
  onEyeToggle?: () => void;
  changeCount?: number;
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
  changeLabel = "No change to save",
  showB4Change: showB4Change = false,
  onEyeToggle,
  changeCount = 0,
}: FormActionsProps) {
  const saveActiveStyles =
    "bg-slate-50 text-emerald-600 border-slate-200 hover:bg-white hover:border-emerald-200 shadow-sm active:scale-95";
  const saveLockedStyles =
    "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70";
  const isActionLocked = isSubmitting || isDisabled;
  const SaveButton = (
    <button
      type="submit"
      form={formId}
      disabled={isActionLocked}
      className={`flex items-center gap-2 border px-8 py-2 rounded-lg font-semibold transition-all
      ${isActionLocked ? saveLockedStyles : saveActiveStyles}`}
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

  const backActiveStyles = "text-slate-500 hover:text-slate-800 cursor-pointer";
  const backLabelFadeStyles = "text-slate-100 select-none";
  //if add cursor-not-allowed pointer-events-none, back is blocked.change slate-100 to transparent will make the label disappear

  const backLabelStyles = `flex items-center text-sm transition-colors ${
    isDisabled ? backLabelFadeStyles : backActiveStyles
  }`;

  const BackActionContent = (
    <div className="flex items-center group cursor-pointer">
      {/* Arrow stays visible and slate-colored always */}
      <ArrowLeft
        size={16}
        className="mr-1 text-slate-400 group-hover:text-slate-700"
      />
      <span
        className={`text-sm font-medium transition-all duration-300 ${backLabelStyles}`}
      >
        {backLabel}
      </span>
    </div>
  );
  //check if fixed path exists and use the path(pro: SEO, prefetch); Otherwise use browse history(pro: keep filter setting); we could check isActionLocked and set href to "#" to match pointer-events-none when locked to prevent navigation
  const BackAction = backHref ? (
    <Link href={backHref}>{BackActionContent}</Link>
  ) : (
    <button type="button" onClick={onBackClick}>
      {BackActionContent}
    </button>
  );

  const ShowChangesToggle =
    changeLabel && onEyeToggle ? (
      <button
        type="button"
        onClick={onEyeToggle}
        aria-expanded={showB4Change}
        className="flex items-center gap-2 text-xs font-semibold tracking-wider
                 text-slate-500 hover:text-slate-800 transition-colors"
      >
        {showB4Change ? (
          <EyeOff size={14} className="text-slate-400" />
        ) : (
          <Eye size={14} className="text-slate-400" />
        )}

        <span className="camel-case">
          {changeCount} {changeLabel}
        </span>
      </button>
    ) : null;

  return (
    <div className="flex justify-between items-center w-full">
      {BackAction}
      {ShowChangesToggle}
      {SaveButton}
    </div>
  );
}
