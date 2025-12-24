import React from "react";
import {
  User,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Pencil,
  ShieldCheck,
  IdCard,
  ShieldPlus,
} from "lucide-react";
import Link from "next/link";
import { Contact, Email, Phone as PhoneType, Address } from "@prisma/client";

// 1. Define a base interface for anything that can be "Primary"
interface PrimarySelectable {
  isPrimary: boolean;
}

// 2. Use a Generic <T> that extends that interface
const getPrimary = <T extends PrimarySelectable>(
  arr: T[] | undefined
): T | undefined => {
  if (!arr || arr.length === 0) return undefined;
  return arr.find((item) => item.isPrimary) || arr[0];
};

// This type represents a Contact WITH its relations included
interface ContactWithRelations extends Contact {
  emails: Email[];
  phones: PhoneType[];
  addresses: Address[];
}

interface ProfilePageProps {
  contact: ContactWithRelations;
}

export default function ProfilePage({ contact }: ProfilePageProps) {
  const primaryEmail = getPrimary(contact.emails);
  const primaryPhone = getPrimary(contact.phones);
  const primaryAddress = getPrimary(contact.addresses);

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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center space-x-4 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <img
          src={profileData.user.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-blue-50"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profileData.user.name}
          </h1>
          <div className="text-slate-500">
            {profileData.employee.title}{" "}
            <InfoItem label="" value="Ottawa, ON" icon={<MapPin size={16} />} />
          </div>
          <div className="space-y-0">
            <InfoItem
              label=""
              value={profileData.user.email}
              icon={<Mail size={16} />}
            />

            <InfoItem
              label=""
              value="+1 (555) 000-0000"
              icon={<Phone size={16} />}
            />
          </div>
        </div>

        {/* Edit Button - Usually points to User Service settings */}
        <Link
          href={`/contacts/edit`}
          title="Edit contact"
          className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-green-50 text-slate-600 px-3 py-1.5 rounded-md text-sm font-medium transition-all border border-transparent hover:border-green-100"
        >
          <Pencil size={14} className="text-green-600" />
        </Link>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <User size={20} />
              <h2 className="font-semibold text-slate-800">
                Account - <span>{profileData.user.email}</span>
              </h2>
            </div>
            <Link
              href={`/users/edit`}
              title="Edit user access"
              className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-green-50 text-slate-600 px-3 py-1.5 rounded-md text-sm font-medium transition-all border border-transparent hover:border-green-100"
            >
              <Pencil size={14} className="text-green-600" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Email Row with Role Badge */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Access
                </span>
                <span className="inline-flex items-center  text-purple-600">
                  <Building size={12} />
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                {/* The Role Badge */}
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                  <h2 className="font-semibold text-slate-800">1 - 10</h2>
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-tight">
                    {profileData.user.role || "Standard User"}
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                  <h2 className="font-semibold text-slate-800">1</h2>
                  <IdCard size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-tight">
                    {"Employee"}
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                  <h2 className="font-semibold text-slate-800">3-5</h2>
                  <ShieldPlus size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-tight">
                    {"Professional"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service 2: Tenant/Employer Context */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-4 text-purple-600">
            <Building size={20} />
            <h2 className="font-semibold text-slate-800">Employment</h2>
          </div>
          <div className="space-y-4">
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
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-4 text-orange-600">
            <Briefcase size={20} />
            <h2 className="font-semibold text-slate-800">Payroll Context</h2>
          </div>
          <div className="space-y-4">
            <InfoItem label="Employee ID" value={profileData.employee.id} />
            <InfoItem
              label="Department"
              value={profileData.employee.department}
            />
            <button className="w-full mt-2 text-sm text-blue-600 hover:underline text-left">
              View Pay Stubs →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
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
    <div className="flex flex-col">
      <span className="text-xs text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center space-x-2 text-slate-700 font-medium">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span>{value}</span>
      </div>
    </div>
  );
}
