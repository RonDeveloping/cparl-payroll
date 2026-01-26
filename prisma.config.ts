// prisma.config.ts
/*CLI will actually read this file when running commands.*/

import "dotenv/config"; // must be imported so environment variables are loaded.
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./db/prisma/schema.prisma", // path to your schema

  datasource: {
    url: process.env.DATABASE_URL!,
  },

  // migrate: {
  //   datasource: {
  //     url: process.env.DATABASE_URL || "",
  //   },
  // },
});
