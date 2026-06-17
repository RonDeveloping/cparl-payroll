// db/prismaDrizzle.ts
import "server-only";
import "dotenv/config"; //  <-  before accessing process.env.DATABASE_URL

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// ✅ Validate DATABASE_URL first
if (!process.env.DATABASE_URL || typeof process.env.DATABASE_URL !== "string") {
  throw new Error("DATABASE_URL is missing or invalid");
}

const isProduction = process.env.NODE_ENV === "production";

const poolMax = Number.parseInt(
  process.env.PGPOOL_MAX ?? (isProduction ? "10" : "1"),
  10,
);
const poolIdleTimeoutMs = Number.parseInt(
  process.env.PGPOOL_IDLE_TIMEOUT_MS ?? "1000",
  10,
);
const poolConnectionTimeoutMs = Number.parseInt(
  process.env.PGPOOL_CONNECTION_TIMEOUT_MS ?? "5000",
  10,
);

const safePoolMax = Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 1;
const safePoolIdleTimeoutMs =
  Number.isFinite(poolIdleTimeoutMs) && poolIdleTimeoutMs >= 0
    ? poolIdleTimeoutMs
    : 1000;
const safePoolConnectionTimeoutMs =
  Number.isFinite(poolConnectionTimeoutMs) && poolConnectionTimeoutMs >= 0
    ? poolConnectionTimeoutMs
    : 5000;

let poolInstance = globalThis.pool;
let prismaInstance = globalThis.prisma;

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: safePoolMax,
      idleTimeoutMillis: safePoolIdleTimeoutMs,
      connectionTimeoutMillis: safePoolConnectionTimeoutMs,
      allowExitOnIdle: !isProduction,
    });

    if (!isProduction) {
      globalThis.pool = poolInstance;
    }
  }

  return poolInstance;
}

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaPg(getPool());
    prismaInstance = new PrismaClient({ adapter });

    if (!isProduction) {
      globalThis.prisma = prismaInstance;
    }
  }

  return prismaInstance;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
}) as PrismaClient;

declare global {
  var prisma: undefined | PrismaClient;
  var pool: undefined | Pool;
}

export default prisma;
