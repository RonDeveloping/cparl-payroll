import "dotenv/config"; // it loads .env and populates process.env so that npx run ts-node prisma/seed.ts works where Node process doesn't do the population automatically unlike in Next.js where .env is auto-loaded

import prisma from "../lib/prisma.ts"; //new a prisma client instance using Database URL from .env in the first query; so it would be better placed after the first import.

await prisma.person.create({
  data: {
    firstName: "Ron",
    lastName: "Liu",

    emails: {
      create: [
        { email: "ron@cparl.com", isPrimary: true },
        { email: "ron.liu@gmail.com" },
      ],
    },

    phones: {
      create: [{ number: "+1 613 410 8880", type: "MOBILE", isPrimary: true }],
    },

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
  },
});
