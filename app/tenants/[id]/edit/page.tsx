// app/tenants/[id]/edit/page.tsx
import prisma from "@/db/prismaDrizzle";
import EditTenantForm from "./edit-tenant";
import { TenantFormInput } from "@/lib/validations/tenant-schema";
import formatBusinessNumber, {
  composeBusinessNumberFromParts,
} from "@/utils/formatters/businessNumber";

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
      operatingName: null,
      legalNameEnding: null,
      businessNumber: null,
      isActive: true,
      memberEmails: "",
      contactPerson: null,
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
  let contactPerson: string | null = null;
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
    const [primaryContact, primaryEmail, primaryPhone, primaryAddress] =
      await Promise.all([
        prisma.contact.findUnique({
          where: { id: tenant.contactId },
        }),
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

    if (primaryContact) {
      contactPerson = primaryContact.displayName;
    }

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
    aliasName?: string | null;
  } | null;
  const businessBn9 = (tenant as { businessBn9?: string | null }).businessBn9;
  const businessProgramId = (tenant as { businessProgramId?: string | null })
    .businessProgramId;
  const businessAccountRef = (tenant as { businessAccountRef?: string | null })
    .businessAccountRef;

  const initialData: TenantFormInput = {
    coreName: nameCached?.coreName || "",
    operatingName: nameCached?.aliasName || null,
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
    businessNumber:
      formatBusinessNumber(
        composeBusinessNumberFromParts({
          bn9: businessBn9,
          programId: businessProgramId,
          accountRef: businessAccountRef,
        }) ?? "",
      ) || null,
    isActive: tenant.isActive,
    memberEmails: "",
    contactPerson,
    email,
    phone,
    address,
  };

  return <EditTenantForm paramsPromise={params} initialData={initialData} />;
}
