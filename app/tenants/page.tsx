"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  legalName: string;
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

  if (tenants.length === 0) {
    return (
      <div className="p-10">
        <p className="text-slate-600">
          No tenants found. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Employers</h1>
        <p className="text-slate-600">Manage your employer organizations</p>
      </div>

      <div className="grid gap-4">
        {tenants.map((tenant) => (
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
                  {tenant.name}
                  <span className="text-slate-500 font-medium">
                    {` (${tenant.legalName})`}
                  </span>
                </Link>
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
        ))}
      </div>
    </div>
  );
}
