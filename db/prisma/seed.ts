import "dotenv/config"; // it loads .env and populates process.env so that npx run ts-node prisma/seed.ts works where Node process doesn't do the population automatically unlike in Next.js where .env is auto-loaded

import prisma from "../prismaDrizzle"; //new a prisma client instance using Database URL from .env in the first query; so it would be better placed after the first import.

import { safe } from "@/utils/validators/safe";

const useWhat = await safe(
  prisma.contact.create({
    data: {
      givenName: "Ron",
      familyName: "Liu",
      /*
      emails: {
        create: [
          { email: "ron@cparl.com", isPrimary: true },
          { email: "ron.liu@gmail.com" },
        ],
      },

      phones: {
        create: [
          { number: "+1 613 410 8880", type: "MOBILE", isPrimary: true },
        ],
      },
      */

      /*
    addresses: {
      create: [
        {
          street: "66 Riverstone Dr",
          city: "Nepean",
          province: "ON",
          postalCode: "K2G1A1",
          country: "Canada",
          isPrimary: true,
        },
      ],
    },

    bankAccounts: {
      create: [
        {
          institutionNumber: 123,
          branchNumber: 45678,
          accountNumber: "000123456789",
          isPrimary: true,
        },
      ],
    },
    */
    },
  }),
);

console.log("Seeded contact:", useWhat);
process.exit(0);
