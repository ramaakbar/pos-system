import { sql } from "drizzle-orm";
import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-typebox";
import { UnwrapSchema } from "elysia";
import { ulid } from "ulid";

export const customersTable = mysqlTable("customers", {
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
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const customerSchema = createSelectSchema(customersTable);

export type Customer = UnwrapSchema<typeof customerSchema>;
