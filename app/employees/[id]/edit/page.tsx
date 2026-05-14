import prisma from "@/db/prismaDrizzle";
import EditEmployeeForm from "./edit-employee";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import formatPhone from "@/utils/formatters/phone";
import formatPostalCode from "@/utils/formatters/postalCode";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    const emptyData: ContactFormInput = {
      givenName: "",
      familyName: "",
      middleName: "",
      nickName: "",
      displayName: "",
      prefix: "",
      suffix: "",
      sin: "",
      dob: "",
      email: "",
      phone: "",
      street: "",
      city: "Ottawa",
      province: "ON",
      postalCode: "",
      country: "Canada",
    };
    return <EditEmployeeForm paramsPromise={params} initialData={emptyData} />;
  }

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      emails: { where: { isPrimary: true }, take: 1 },
      addresses: { where: { isPrimary: true }, take: 1 },
      phones: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!contact) {
    return (
      <div className="p-8">
        <p className="text-red-600">Employee not found</p>
      </div>
    );
  }

  const initialData: ContactFormInput = {
    givenName: contact.coreName,
    familyName: contact.kindName,
    middleName: "",
    nickName: contact.aliasName || "",
    prefix: "",
    suffix: "",
    displayName: contact.displayName || "",
    sin: "",
    dob: "",
    email: contact.emails[0]?.emailAddress || "",
    phone: formatPhone(contact.phones[0]?.number) || "",
    street: contact.addresses[0]?.street || "",
    city: contact.addresses[0]?.city || "",
    province: contact.addresses[0]?.province || "ON",
    postalCode: formatPostalCode(contact.addresses[0]?.postalCode) || "",
    country: contact.addresses[0]?.country || "Canada",
  };

  return <EditEmployeeForm paramsPromise={params} initialData={initialData} />;
}
