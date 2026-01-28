//@components/FormLayout.tsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { FormActions } from "./form-actions";

interface FormLayoutProps {
  children: React.ReactNode;
  formId: string;
  isSubmitting: boolean;
  isDirty: boolean;
  domain: string; // e.g., "contacts", "employees", "tenants"
  id: string; // The ID from params
  changeLabel?: string;
  changeCount?: number;
  // optionalExpanded?: boolean;
  showChanges?: boolean;
  onEyeToggle?: () => void;
}

export default function FormLayout({
  children,
  formId,
  isSubmitting,
  domain,
  id,
  isDirty,
  changeLabel,
  changeCount,
  // optionalExpanded,
  showChanges,
  onEyeToggle: onEyeToggle,
}: FormLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Detect if we came from a filtered list
  const fromList = searchParams.get("fromList") === "true";
  const isNew = id === "new";
  // Constants defined once for the whole app
  const saveLabel = isNew ? "Create" : "Confirm Changes";
  const backLabel = isNew ? "Cancel" : "Discard Changes";
  // If it's a brand new record, ALWAYS go back to the main list (not filtered one). Only if it's an edit AND we have the 'fromList' flag, use browser history.
  const useHistoryBack = !isNew && fromList;
  //Centralized path logic Returns e.g. "/contacts" if new, or "/contacts/clx123..." if existing
  const safeBackPath = isNew ? `/${domain}` : `/${domain}/${id}`;

  const renderActions = () => (
    <div className={"mb-8"}>
      <FormActions
        formId={formId} //this id links a button to a form
        isSubmitting={isSubmitting}
        isDisabled={!isDirty}
        onBackClick={useHistoryBack ? () => router.back() : undefined}
        backHref={useHistoryBack ? undefined : safeBackPath} //next.js pre-fetches the data for the route in backHref as soon as the link enters the viewport where as onBackClick cann't be pre-fetched or SEOs. onBackClick={() => router.back()} usually for "Cancel" button on a Search Filter as it won't reset the filter and show what was underneath it exactly. But not good for bookmarked page or direct link as well as page being refreshed while editing(as history stack is reset). onBackClick is a fallback button logic if no backHref <Link>; with useRouter();
        backLabel={backLabel}
        saveLabel={saveLabel}
        changeLabel={changeLabel}
        changeCount={changeCount}
        showB4Change={showChanges}
        onEyeToggle={onEyeToggle}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Top Buttons */}
      {renderActions()}

      {/* The actual Form Fields */}
      {children}

      {/* Bottom Buttons */}
      {renderActions()}
    </div>
  );
}
