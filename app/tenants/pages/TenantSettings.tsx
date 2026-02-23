// pages/TenantSettings.tsx
import React from "react";
import { useTenant } from "../context/TenantContext";

export const TenantSettingsPage: React.FC = () => {
  const { tenant } = useTenant();

  if (!tenant) return <div>Loading tenant settings...</div>;

  const nameCached = tenant.nameCached as {
    coreName?: string;
    kindName?: string | null;
    aliasName?: string | null;
    displayName?: string | null;
  };
  const tenantName =
    nameCached.displayName?.trim() ||
    nameCached.aliasName?.trim() ||
    [nameCached.coreName, nameCached.kindName].filter(Boolean).join(" ").trim();

  return (
    <div
      style={{
        padding: "20px",
        borderTop: "4px solid #000",
      }}
    >
      <h1>{tenantName || "Tenant"} Settings</h1>

      <section>
        <h3>General Information</h3>
        <p>
          <strong>Tenant ID:</strong> {tenant.id}
        </p>
        <p>
          <strong>URL Slug:</strong> /{tenant.slug}
        </p>
        <p>
          <strong>Business Number:</strong> {tenant.businessNumber || "Not set"}
        </p>
      </section>

      <section>
        <h3>Branding</h3>

        <p>Primary Theme Color: </p>
      </section>

      {!tenant.isActive && (
        <div
          style={{ background: "#ffebee", color: "#c62828", padding: "10px" }}
        >
          This tenant account is currently <strong>Paused</strong>.
        </div>
      )}
    </div>
  );
};
export default TenantSettingsPage;
