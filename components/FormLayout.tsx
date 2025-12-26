//@components/FormLayout.tsx
"use client";

import { FormActions } from "./FormActions";

interface FormLayoutProps {
  children: React.ReactNode;
  formId: string;
  isSubmitting: boolean;
  safeBackPath: string;
  isNew: boolean;
}

export default function FormLayout({
  children,
  formId,
  isSubmitting,
  safeBackPath,
  isNew,
}: FormLayoutProps) {
  // Constants defined once for the whole app
  const saveLabel = isNew ? "Create" : "Confirm Changes";
  const backLabel = isNew ? "Cancel" : "Discard";

  const renderActions = () => (
    <div className={"mb-8"}>
      <FormActions
        formId={formId} //this id links a button to a form
        isSubmitting={isSubmitting}
        backHref={safeBackPath} //next.js pre-fetches the data for the route in backHref as soon as the link enters the viewport where as onBackClick cann't be pre-fetched or SEOs.
        // onBackClick={() => router.back()} usually for "Cancel" button on a Search Filter as it won't reset the filter and show what was underneath it exactly. But not good for bookmarked page or direct link as well as page being refreshed while editing(as history stack is reset). onBackClick is a fallback button logic if no backHref <Link>
        backLabel={backLabel}
        saveLabel={saveLabel}
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
