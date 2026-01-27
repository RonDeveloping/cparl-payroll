// db/drizzle/customTypes.ts
import { customType } from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});
/*
Use it in drizzle schemas like this:
import { bytea } from "./customTypes";
encryptedTaxID: bytea("encrypted_tax_id").notNull(),
*/
