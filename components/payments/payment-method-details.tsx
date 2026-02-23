"use client";

import PaymentMethodForm from "@/components/payments/payment-method-form";

export default function PaymentMethodDetails({
  variant = "page",
  userGivenName,
  userFamilyName,
  userPrimaryPostalCode,
}: {
  variant?: "page" | "tile";
  userGivenName?: string | null;
  userFamilyName?: string | null;
  userPrimaryPostalCode?: string | null;
}) {
  const isTile = variant === "tile";

  return (
    <div className={isTile ? "space-y-4" : "space-y-6"}>
      {!isTile && (
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Methods</h1>
          <p className="text-slate-600">
            Add a credit or debit card for payroll funding.
          </p>
        </div>
      )}

      <div
        className={
          isTile
            ? ""
            : "rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        }
      >
        <PaymentMethodForm
          compact={isTile}
          userGivenName={userGivenName}
          userFamilyName={userFamilyName}
          userPrimaryPostalCode={userPrimaryPostalCode}
        />
      </div>
    </div>
  );
}
