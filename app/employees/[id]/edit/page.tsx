// app/employees/[id]/edit/page.tsx
import prisma from "@/db/prismaDrizzle";
import EditEmployeeForm from "./edit-employee";
import { ContactFormInput } from "@/lib/validations/contact-schema";
import formatPhone from "@/utils/formatters/phone";
import formatPostalCode from "@/utils/formatters/postalCode";

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { id } = await params;
  const { tenantId } = await searchParams;
  const todayIso = new Date().toISOString().slice(0, 10);

  const blankBankAccount = {
    id: "",
    institutionNumber: "",
    bankDetails: "",
    distributionType: undefined,
    distributionValue: "",
  };

  const ensureMinimumBankRows = (
    bankAccounts: Array<{
      id: string;
      institutionNumber: string;
      bankDetails: string;
      distributionType?: "FIXED_AMOUNT" | "PERCENTAGE" | "REMAINDER";
      distributionValue: string;
    }>,
    minimumRows = 1,
  ) => [
    ...bankAccounts,
    ...Array.from(
      { length: Math.max(0, minimumRows - bankAccounts.length) },
      () => ({
        ...blankBankAccount,
      }),
    ),
  ];

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
      employeeNumber: "",
      employmentTitle: "",
      employmentDepartment: "",
      hireDate: todayIso,
      employmentEndDate: "",
      employmentProvinceCode: "ON",
      terminationReason: undefined,
      jobPayType: undefined,
      jobStartDate: "",
      jobPayRate: "",
      jobEndDate: "",
      status: "ACTIVE",
      email: "",
      phone: "",
      street: "",
      city: "Ottawa",
      province: "ON",
      postalCode: "",
      country: "Canada",
      bankAccounts: ensureMinimumBankRows([
        {
          ...blankBankAccount,
          distributionType: "PERCENTAGE",
          distributionValue: "100",
        },
      ]),
    };
    return (
      <EditEmployeeForm
        paramsPromise={params}
        initialData={emptyData}
        bankAccountStatuses={["UNVERIFIED"]}
        tenantId={tenantId}
      />
    );
  }

  const employee = tenantId
    ? await prisma.employee.findFirst({
        where: { contactId: id, tenantId },
        select: {
          id: true,
          employeeNumber: true,
          dateOfBirth: true,
          hireDate: true,
          status: true,
        },
      })
    : await prisma.employee.findFirst({
        where: { contactId: id },
        select: {
          id: true,
          employeeNumber: true,
          dateOfBirth: true,
          hireDate: true,
          status: true,
        },
      });

  const employment = employee?.id
    ? await prisma.employment.findFirst({
        where: tenantId
          ? { employeeId: employee.id, tenantId }
          : { employeeId: employee.id },
        select: {
          id: true,
          title: true,
          department: true,
          provinceCode: true,
          endDate: true,
          terminationReason: true,
          startDate: true,
        },
        orderBy: { startDate: "desc" },
      })
    : null;

  const jobAssignment = employment?.id
    ? await prisma.jobAssignment.findFirst({
        where: { employmentId: employment.id },
        select: {
          startDate: true,
          payType: true,
          payRate: true,
          endDate: true,
        },
        orderBy: { startDate: "desc" },
      })
    : null;

  const bankAccounts = employee?.id
    ? await prisma.bankAccount.findMany({
        where: { employeeId: employee.id, isActive: true },
        select: {
          id: true,
          institutionNumber: true,
          branchNumber: true,
          accountNumber: true,
          label: true,
          type: true,
          value: true,
          priority: true,
          verificationStatus: true,
        },
        orderBy: [{ isPrimary: "desc" }, { priority: "asc" }],
      })
    : [];

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
    dob: employee?.dateOfBirth
      ? employee.dateOfBirth.toISOString().slice(0, 10)
      : "",
    employeeNumber: employee?.employeeNumber || "",
    employmentTitle: employment?.title || "",
    employmentDepartment: employment?.department || "",
    hireDate: employee?.hireDate
      ? employee.hireDate.toISOString().slice(0, 10)
      : "",
    employmentEndDate: employment?.endDate
      ? employment.endDate.toISOString().slice(0, 10)
      : "",
    employmentProvinceCode: employment?.provinceCode || "ON",
    terminationReason: employment?.terminationReason || undefined,
    jobPayType: jobAssignment?.payType || undefined,
    jobStartDate: jobAssignment?.startDate
      ? jobAssignment.startDate.toISOString().slice(0, 10)
      : "",
    jobPayRate: jobAssignment?.payRate?.toString() || "",
    jobEndDate: jobAssignment?.endDate
      ? jobAssignment.endDate.toISOString().slice(0, 10)
      : "",
    status: employee?.status || "ACTIVE",
    email: contact.emails[0]?.emailAddress || "",
    phone: formatPhone(contact.phones[0]?.number) || "",
    street: contact.addresses[0]?.street || "",
    city: contact.addresses[0]?.city || "",
    province: contact.addresses[0]?.province || "ON",
    postalCode: formatPostalCode(contact.addresses[0]?.postalCode) || "",
    country: contact.addresses[0]?.country || "Canada",
    bankAccounts:
      bankAccounts.length > 0
        ? ensureMinimumBankRows(
            bankAccounts.map((account) => ({
              id: account.id,
              institutionNumber: String(account.institutionNumber).padStart(
                3,
                "0",
              ),
              bankDetails: `${String(account.branchNumber).padStart(5, "0")}-${account.accountNumber}`,
              distributionType: account.type || undefined,
              distributionValue: account.value?.toString() || "",
            })),
          )
        : ensureMinimumBankRows([
            {
              ...blankBankAccount,
              distributionType: "PERCENTAGE",
              distributionValue: "100",
            },
          ]),
  };

  const bankAccountStatuses =
    bankAccounts.length > 0
      ? [
          ...bankAccounts.map((a) => a.verificationStatus),
          ...Array.from(
            { length: Math.max(0, 1 - bankAccounts.length) },
            () => "UNVERIFIED" as const,
          ),
        ]
      : (["UNVERIFIED"] as const);

  return (
    <EditEmployeeForm
      paramsPromise={params}
      initialData={initialData}
      bankAccountStatuses={bankAccountStatuses}
      tenantId={tenantId}
    />
  );
}
