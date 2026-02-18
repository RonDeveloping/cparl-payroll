//@components\FormActions.tsx
"use client";

import { Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { formActionsStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";

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
  const saveActiveStyles = formActionsStyles.saveActive;
  const saveLockedStyles = formActionsStyles.saveLocked;
  const isActionLocked = isSubmitting || isDisabled;
  const SaveButton = (
    <button
      type="submit"
      form={formId}
      disabled={isActionLocked}
      className={cn(
        formActionsStyles.saveButtonBase,
        isActionLocked ? saveLockedStyles : saveActiveStyles,
      )}
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

  const backActiveStyles = formActionsStyles.backLabelActive;
  const backLabelFadeStyles = formActionsStyles.backLabelDisabled;
  //if add cursor-not-allowed pointer-events-none, back is blocked.change slate-100 to transparent will make the label disappear

  const backLabelStyles = cn(
    formActionsStyles.backLabelBase,
    isDisabled ? backLabelFadeStyles : backActiveStyles,
  );

  const BackActionContent = (
    <div className={formActionsStyles.backActionWrapper}>
      {/* Arrow stays visible and slate-colored always */}
      <ArrowLeft size={16} className={formActionsStyles.backArrow} />
      <span className={backLabelStyles}>{backLabel}</span>
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
        className={formActionsStyles.showChangesButton}
      >
        {showB4Change ? (
          <EyeOff size={14} className={formActionsStyles.showChangesIcon} />
        ) : (
          <Eye size={14} className={formActionsStyles.showChangesIcon} />
        )}

        <span className={formActionsStyles.showChangesCount}>
          {changeCount} {changeLabel}
        </span>
      </button>
    ) : null;

  return (
    <div className={formActionsStyles.container}>
      {BackAction}
      {ShowChangesToggle}
      {SaveButton}
    </div>
  );
}
