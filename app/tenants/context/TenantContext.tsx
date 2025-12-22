"use client";
// context/TenantContext.tsx
import React, { createContext, useContext, useState } from "react";
import { Tenant } from "@prisma/client"; //schema generated types from Prisma

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
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
