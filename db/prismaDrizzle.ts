import "dotenv/config"; //  <-  before accessing process.env.DATABASE_URL

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { drizzle } from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

// ✅ Validate DATABASE_URL first
if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== "string") {
  throw new Error("DATABASE_URL is missing or invalid");
}

// 2. the Node-PostgreSQL connection pool's the only thing that talks to the PostgreSQL server; MR Hot checks globalThis for existing instance first to reuse in dev before building a new one.
const pool =
  globalThis.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 20 });

// 3. Prisma Client setup with the adapter child of the pool
const adapter = new PrismaPg(pool);
const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

// 4. Drizzle ORM setup as a direct child of the same pool
const drizzleDb = globalThis.drizzleDb ?? drizzle(pool);

declare global {
  var prisma: undefined | PrismaClient;
  var drizzleDb: undefined | NodePgDatabase;
  var pool: undefined | Pool;
}

// 5. Save to globalThis in development to prevent leaks
if (process.env.NODE_ENV !== "production") {
  globalThis.pool = pool;
  globalThis.prisma = prisma;
  globalThis.drizzleDb = drizzleDb;
}

export { drizzleDb, pool };
export default prisma;
