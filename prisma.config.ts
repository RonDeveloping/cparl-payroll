// prisma.config.ts
/*CLI will actually read this file when running commands.*/

import "dotenv/config"; //dotenv/config must be imported so environment variables are loaded.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // path to your schema
  migrations: { seed: "ts-node prisma/seed.ts" }, // path to your seed file
  datasource: {
    url: env("DATABASE_URL"), // connection for Migrate
  },
});
