// app/tenants/[id]/edit/page.tsx
import prisma from "@/db/prismaDrizzle";
import EditTenantForm from "./edit-tenant";
import { TenantFormInput } from "@/lib/validations/tenant-schema";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Handle new tenant creation
  if (id === "new") {
    const emptyData: TenantFormInput = {
      name: "",
      slug: "",
      legalName: "",
      businessNumber: null,
      isActive: true,
      userRole: "owner",
      memberEmails: "",
    };
    return <EditTenantForm paramsPromise={params} initialData={emptyData} />;
  }

  // Fetch existing tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      settings: true,
    },
  });

  if (!tenant) {
    return (
      <div className="p-8">
        <p className="text-red-600">Tenant not found</p>
      </div>
    );
  }

  const initialData: TenantFormInput = {
    name: tenant.name,
    slug: tenant.slug,
    legalName: tenant.legalName,
    businessNumber: tenant.businessNumber,
    isActive: tenant.isActive,
    userRole: undefined,
    memberEmails: "",
  };

  return <EditTenantForm paramsPromise={params} initialData={initialData} />;
}
