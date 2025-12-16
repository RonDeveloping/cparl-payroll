import prisma from "../lib/prisma.ts";
// import { safe } from "../utils/safe.ts";
import "dotenv/config"; // <- must be the first import before accessing process.env.DATABASE_URL

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
