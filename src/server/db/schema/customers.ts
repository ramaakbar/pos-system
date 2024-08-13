import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { ulid } from "ulid";
import { z } from "zod";

import { generateCode } from "@/server/lib/utils";

export const customersTable = pgTable("customers", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: varchar("code", { length: 125 })
    .unique()
    .$defaultFn(() => generateCode("CAT"))
    .notNull(),
  name: varchar("name", {
    length: 255,
  })
    .unique()
    .notNull(),
  email: varchar("email", {
    length: 255,
  }).unique(),
  createdAt: timestamp("created_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("modified_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export const customerSchema = createSelectSchema(customersTable);

export type Customer = z.infer<typeof customerSchema>;
