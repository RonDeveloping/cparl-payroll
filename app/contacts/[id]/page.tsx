//app\contacts\[id]\page.tsx
import { redirect } from "next/navigation";
import React from "react";
import prisma from "@/db/prismaDrizzle";
import {
  User,
  Building,
  Briefcase,
  Mail,
  PhoneIcon,
  MapPin,
  Pencil,
  ShieldCheck,
  IdCard,
  ShieldPlus,
} from "lucide-react";
import Link from "next/link";
import { contactProfileStyles } from "@/constants/styles";
// import { Contact, Email, Phone, Address } from "@prisma/client";

// 1. Define a base interface for anything that can be "Primary"
interface PrimarySelectable {
  isPrimary: boolean;
}

// 2. Use a Generic <T> that extends that interface
const getPrimary = <T extends PrimarySelectable>(
  arr: T[] | undefined,
): T | undefined => {
  if (!arr || arr.length === 0) return undefined;
  return arr.find((item) => item.isPrimary) || arr[0];
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>; //In Next 15, params is an asynchoronous object
}) {
  let initialData = null;
  const { id } = await params; //as params is a promise for asynchronous dynamic routes

  if (id == "new") {
    return redirect("/contacts/new/edit");
  } else {
    const dbContact = await prisma.contact.findUnique({
      where: { id },
      include: {
        emails: { where: { isPrimary: true }, take: 1 },
        addresses: { where: { isPrimary: true }, take: 1 },
        phones: { where: { isPrimary: true }, take: 1 },
      },
    });

    const profileData = {
      user: {
        name: "Jordan Smith",
        email: "jordan.s@example.com",
        avatar: "/api/placeholder/150/150",
        role: "Administrator",
      },
      tenant: {
        companyName: "11113333 Ontario Inc.(o/a Enterprise Center)",
        domain: "acme-na.payroll.com",
      },
      employee: {
        title: "66 Riverstone Dr  K1A 0G9",
        id: "EMP-9902",
        department: "Engineering",
        status: "Active",
      },
    };

    if (dbContact) {
      // Flatten the Prisma structure to match your ContactFormValues type
      const primaryAddress = getPrimary(dbContact.addresses);

      initialData = {
        givenName: dbContact.givenName,
        familyName: dbContact.familyName,
        email: getPrimary(dbContact.emails),
        phone: getPrimary(dbContact.phones),
        nickName: dbContact.nickName || "",
        displayName: dbContact.displayName || "",
        street: primaryAddress?.street || "",
        city: primaryAddress?.city || "Ottawa",
        province: primaryAddress?.province || "ON",
        country: primaryAddress?.country || "Canada",
        postalCode: primaryAddress?.postalCode || "",
      };

      return (
        <div className={contactProfileStyles.pageContainer}>
          {/* Header Section */}
          <div className={contactProfileStyles.headerCard}>
            <img
              src={profileData.user.avatar}
              alt="Profile"
              className={contactProfileStyles.avatar}
            />
            <div>
              <h1 className={contactProfileStyles.nameTitle}>
                {initialData
                  ? `${initialData.givenName} ${initialData.familyName}`
                  : "New Contact"}
              </h1>
              <div className={contactProfileStyles.subtleText}>
                {/* Display the flattened address from initialData */}
                {initialData?.street ? (
                  <InfoItem
                    label=""
                    value={`${initialData.street}, ${initialData.city}`}
                    icon={<MapPin size={16} />}
                  />
                ) : (
                  "No address set"
                )}
              </div>
              <div className={contactProfileStyles.infoList}>
                <InfoItem
                  label=""
                  value={
                    initialData?.email?.emailAddress || "No email provided"
                  }
                  icon={<Mail size={16} />}
                />

                <InfoItem
                  label=""
                  value={initialData?.phone?.number || "No phone provided"}
                  icon={<PhoneIcon size={16} />}
                />
              </div>
            </div>

            {/* Edit Button - Usually points to User Service settings */}
            <Link
              href={`/contacts/${id}/edit`}
              title="Edit contact"
              className={contactProfileStyles.editButton}
            >
              <Pencil size={14} className={contactProfileStyles.editIcon} />
            </Link>

            <section className={contactProfileStyles.sectionCard}>
              <div className={contactProfileStyles.sectionHeaderRow}>
                <div className={contactProfileStyles.sectionHeaderLeftBlue}>
                  <User size={20} />
                  <h2 className={contactProfileStyles.sectionTitle}>
                    Account - <span>{profileData.user.email}</span>
                  </h2>
                </div>
                <Link
                  href={`/users/edit`}
                  title="Edit user access"
                  className={contactProfileStyles.editButton}
                >
                  <Pencil size={14} className={contactProfileStyles.editIcon} />
                </Link>
              </div>

              <div className={contactProfileStyles.sectionContent}>
                {/* Email Row with Role Badge */}
                <div className={contactProfileStyles.columnStack}>
                  <div className={contactProfileStyles.accessRow}>
                    <span className={contactProfileStyles.metaLabel}>
                      Access
                    </span>
                    <span className={contactProfileStyles.accessIcon}>
                      <Building size={12} />
                    </span>
                  </div>

                  <div className={contactProfileStyles.badgeRow}>
                    {/* The Role Badge */}
                    <div className={contactProfileStyles.badge}>
                      <h2 className={contactProfileStyles.badgeTitle}>
                        1 - 10
                      </h2>
                      <ShieldCheck
                        size={14}
                        className={contactProfileStyles.badgeIcon}
                      />
                      <span className={contactProfileStyles.badgeText}>
                        {profileData.user.role || "Standard User"}
                      </span>
                    </div>

                    <div className={contactProfileStyles.badge}>
                      <h2 className={contactProfileStyles.badgeTitle}>1</h2>
                      <IdCard
                        size={14}
                        className={contactProfileStyles.badgeIcon}
                      />
                      <span className={contactProfileStyles.badgeText}>
                        {"Employee"}
                      </span>
                    </div>

                    <div className={contactProfileStyles.badge}>
                      <h2 className={contactProfileStyles.badgeTitle}>3-5</h2>
                      <ShieldPlus
                        size={14}
                        className={contactProfileStyles.badgeIcon}
                      />
                      <span className={contactProfileStyles.badgeText}>
                        {"Professional"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={contactProfileStyles.detailGrid}>
            {/* Service 2: Tenant/Employer Context */}
            <section className={contactProfileStyles.sectionCard}>
              <div className={contactProfileStyles.sectionHeaderLeftPurple}>
                <Building size={20} />
                <h2 className={contactProfileStyles.sectionTitle}>
                  Employment
                </h2>
              </div>
              <div className={contactProfileStyles.sectionContent}>
                <InfoItem
                  label="Employee Specific"
                  value="SIN#: ******305;  DOB: Sep 9, 1990"
                />

                <InfoItem
                  label="Organization"
                  value="1- 111133333 Ontario Inc.(o/a Enterprise Center)"
                />
              </div>
            </section>

            {/* Service 3: Employee/Payroll Context */}
            <section className={contactProfileStyles.sectionCard}>
              <div className={contactProfileStyles.sectionHeaderLeftOrange}>
                <Briefcase size={20} />
                <h2 className={contactProfileStyles.sectionTitle}>
                  Payroll Context
                </h2>
              </div>
              <div className={contactProfileStyles.sectionContent}>
                <InfoItem label="Employee ID" value={profileData.employee.id} />
                <InfoItem
                  label="Department"
                  value={profileData.employee.department}
                />
                <button className={contactProfileStyles.payrollLinkButton}>
                  View Pay Stubs →
                </button>
              </div>
            </section>
          </div>
        </div>
      );
    } else {
      //The "Not Found" Guard
      return (
        <div className={contactProfileStyles.notFoundContainer}>
          <h1 className={contactProfileStyles.notFoundTitle}>
            Contact Not Found
          </h1>
          <p className={contactProfileStyles.notFoundText}>
            The contact ID you are looking for does not exist.
          </p>
          <Link href="/contacts" className={contactProfileStyles.notFoundLink}>
            ← Back to Contacts List
          </Link>
        </div>
      );
    }
  }
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={contactProfileStyles.infoItem}>
      <span className={contactProfileStyles.metaLabel}>{label}</span>
      <div className={contactProfileStyles.infoValueRow}>
        {icon && <span className={contactProfileStyles.infoIcon}>{icon}</span>}
        <span>{value}</span>
      </div>
    </div>
  );
}
