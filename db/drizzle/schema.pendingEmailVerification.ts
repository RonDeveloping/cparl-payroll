// db/drizzle/schema.pendingEmailVerification.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pendingEmailVerification = pgTable("pending_email_verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
