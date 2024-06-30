import { sql } from "drizzle-orm";
import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-typebox";
import { UnwrapSchema } from "elysia";
import { ulid } from "ulid";

export const categoriesTable = mysqlTable("categories", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: varchar("name", {
    length: 255,
  })
    .unique()
    .notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const categorySchema = createSelectSchema(categoriesTable);

export type Category = UnwrapSchema<typeof categorySchema>;
