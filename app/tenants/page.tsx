"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import formatBusinessNumber, {
  composeBusinessNumberFromParts,
} from "@/utils/formatters/businessNumber";

interface Tenant {
  id: string;
  nameCached: {
    coreName: string;
    kindName?: string | null;
    aliasName?: string | null;
  };
  slug: string;
  businessBn9: string | null;
  businessProgramId: string | null;
  businessAccountRef: string | null;
  isActive: boolean;
  createdAt: Date;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch("/api/tenants");
        if (response.ok) {
          const data = await response.json();
          setTenants(data);
        }
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
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
            const displayBusinessNumber =
              formatBusinessNumber(
                composeBusinessNumberFromParts({
                  bn9: tenant.businessBn9,
                  programId: tenant.businessProgramId,
                  accountRef: tenant.businessAccountRef,
                }) ?? "",
              ) || null;

            return (
              <div
                key={tenant.id}
                className="border border-slate-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href="/payroll"
                      className="text-xl font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {tenant.nameCached.coreName}
                      {tenant.nameCached.kindName && (
                        <span>{` ${tenant.nameCached.kindName}`}</span>
                      )}
                      {tenant.nameCached.aliasName && (
                        <span className="text-slate-500 font-medium">
                          {` (o/a ${tenant.nameCached.aliasName})`}
                        </span>
                      )}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {displayBusinessNumber ||
                        "Valid business no. is required in remitting and reporting."}
                    </p>
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
