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
      coreName: "",
      legalNameEnding: null,
      businessNumber: null,
      isActive: true,
      memberEmails: "",
      email: null,
      phone: null,
      address: null,
    };
    return <EditTenantForm paramsPromise={params} initialData={emptyData} />;
  }

  // Fetch existing tenant with contact information
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

  // Fetch contact information
  let email: string | null = null;
  let phone: string | null = null;
  let address: {
    street?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null = null;

  if (tenant.contactId) {
    const [primaryEmail, primaryPhone, primaryAddress] = await Promise.all([
      prisma.email.findFirst({
        where: { contactId: tenant.contactId, isPrimary: true },
      }),
      prisma.phone.findFirst({
        where: { contactId: tenant.contactId, isPrimary: true },
      }),
      prisma.address.findFirst({
        where: { contactId: tenant.contactId, isPrimary: true },
      }),
    ]);

    if (primaryEmail) {
      email = primaryEmail.emailAddress;
    }

    if (primaryPhone) {
      phone = primaryPhone.number;
    }

    if (primaryAddress) {
      address = {
        street: primaryAddress.street,
        city: primaryAddress.city,
        province: primaryAddress.province,
        postalCode: primaryAddress.postalCode,
        country: primaryAddress.country,
      };
    }
  }

  // Extract coreName and kindName from nameCached JSON
  const nameCached = tenant.nameCached as {
    coreName: string;
    kindName?: string | null;
  } | null;

  const initialData: TenantFormInput = {
    coreName: nameCached?.coreName || "",
    legalNameEnding:
      (nameCached?.kindName as
        | "Inc."
        | "Corp."
        | "Ltd"
        | "Limited"
        | "Incorporated"
        | "Corporation"
        | undefined
        | null) || null,
    businessNumber: tenant.businessNumber,
    isActive: tenant.isActive,
    memberEmails: "",
    email,
    phone,
    address,
  };

  return <EditTenantForm paramsPromise={params} initialData={initialData} />;
}
