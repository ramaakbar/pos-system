import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";
import { UnwrapSchema } from "elysia";
import { ulid } from "ulid";

export const customersTable = pgTable("customers", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: varchar("name", {
    length: 255,
  })
    .unique()
    .notNull(),
  email: varchar("email", {
    length: 255,
  }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const customerSchema = createSelectSchema(customersTable);

export type Customer = UnwrapSchema<typeof customerSchema>;