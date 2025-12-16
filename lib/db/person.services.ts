//lib/db/person.services.ts
import prisma from "../../lib/prisma";

export async function createPersonWithDetails(data: {
  firstName: string;
  lastName: string;
  emails: { email: string; isPrimary?: boolean }[];
  phones?: {
    number: string;
    phoneType?: "MOBILE" | "HOME" | "WORK";
    isPrimary?: boolean;
  }[];
  addresses?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    isPrimary?: boolean;
  }[];
  bankAccounts?: {
    institutionNumber: number;
    branchNumber: number;
    accountNumber: string;
    isPrimary?: boolean;
  }[];
}) {
  return prisma.person.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,

      emails: { create: data.emails },
      phones: data.phones ? { create: data.phones } : undefined,
      addresses: data.addresses ? { create: data.addresses } : undefined,
      bankAccounts: data.bankAccounts
        ? { create: data.bankAccounts }
        : undefined,
    },
  });
}
