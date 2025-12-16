import "dotenv/config"; // // <- must be the first import before accessing process.env.DATABASE_URL
import { PrismaClient } from "@prisma/client";
// 1. Import the Node-PostgreSQL adapter
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ✅ Validate DATABASE_URL first
if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== "string") {
  throw new Error("DATABASE_URL is missing or invalid");
}

const connectionString = process.env.DATABASE_URL;

// 2. Create the Node-PostgreSQL connection pool
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  // 3. Pass the adapter to the Prisma Client constructor
  return new PrismaClient({ adapter });
};

// ... (keep the rest of the file the same for globalThis setup) ...

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
