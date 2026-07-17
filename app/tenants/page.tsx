"use client";
// app/tenants/page.tsx

import { useEffect, useState } from "react";
import { getTenants } from "@/lib/api";
import type { TenantSummaryDto } from "@/lib/dto/tenant";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Clarification } from "@/components/clarification";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTenants()
      .then((data) => setTenants(data))
      .catch((error) => {
        console.error("Failed to fetch tenants:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-10">
        <p>Loading tenants...</p>
      </div>
    );
  }

  const employerHeading =
    tenants.length === 0
      ? "No employers under your management"
      : tenants.length === 1
        ? "1 employer under your management"
        : `${tenants.length} employers under your management`;

  return (
    <div className="p-10 space-y-8">
      <div>
        <p className="text-slate-600">{employerHeading}</p>
      </div>

      {tenants.length === 0 ? (
        <p className="text-slate-600">Create one to get started.</p>
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => {
            return (
              <div
                key={tenant.id}
                className="border border-slate-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/payroll?tenantId=${tenant.id}`}
                      className="text-xl font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {tenant.displayName}
                    </Link>
                    <dl className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          <Clarification
                            term="Business number"
                            description="Shows BN9 only (up to 9 digits). CRA payroll account format is BN9 + RP + 4-digit reference number, for example 123456789 RP0001."
                          />
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {tenant.displayBusinessBn9 || "Not set"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          <Clarification
                            term="Postal code"
                            description="Primary mailing postal code used for payroll reporting correspondence."
                          />
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {tenant.postalCode || "Not set"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          <Clarification
                            term="Payroll frequency"
                            description="How often employees under this employer are paid."
                          />
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {tenant.payrollFrequency || "Not set"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          <Clarification
                            term="Pay period end"
                            description="Current pay period end configuration from the active pay schedule."
                          />
                        </dt>
                        <dd className="mt-1 font-medium text-slate-800">
                          {tenant.payPeriodEnd || "Not set"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Link
                    href={`/tenants/${tenant.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
