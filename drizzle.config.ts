import "dotenv/config"; // Required to read your DATABASE_URL
// import { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

export default {
  out: "./db/drizzle/migrations", // Where Drizzle stores snapshots/metadata
  schema: "./db/drizzle/schema.ts", // Where your Drizzle table definitions live
  dialect: "postgresql", // The "language" of your DB
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
