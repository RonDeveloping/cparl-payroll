"use client"; //files are Server Components by default in Next.js 13+, so we need to add this directive to use Client Component features like useState and useContext

// import React from "react";
import { useTenant } from "./context/TenantContext";

export default function TenantPage() {
  const { tenant } = useTenant();

  if (!tenant) {
    return (
      <div className="p-10">
        <p>No tenant selected. Please select a tenant to view settings.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h1>{tenant.name} Settings</h1>

      <section className="mt-4">
        <h3>General Information</h3>
        <p>
          <strong>Tenant ID:</strong> {tenant.id}
        </p>
        <p>
          <strong>URL Slug:</strong> /{tenant.slug}
        </p>
      </section>

      {tenant.isActive && (
        <div className="bg-red-100 text-red-800 p-4 mt-4">
          This tenant account is currently <strong>Paused</strong>.
        </div>
      )}
    </div>
  );
}
