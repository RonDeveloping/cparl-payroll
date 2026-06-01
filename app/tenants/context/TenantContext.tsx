"use client";
// context/TenantContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenants } from "@/lib/api";
import { Tenant } from "@prisma/client"; //schema generated types from Prisma

type TenantSummary = {
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
  createdAt: string;
};

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  tenants: TenantSummary[];
  tenantsLoading: boolean;
  tenantsError: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getTenants()
      .then((data) => {
        if (isMounted) {
          setTenants(data);
          setTenantsError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setTenantsError(
            error instanceof Error ? error.message : "Failed to fetch tenants",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setTenantsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <TenantContext.Provider
      value={{ tenant, setTenant, tenants, tenantsLoading, tenantsError }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context)
    throw new Error("useTenant must be used within a TenantProvider");
  return context;
};
