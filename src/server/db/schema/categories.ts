import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";
import { UnwrapSchema } from "elysia";
import { ulid } from "ulid";

export const categoriesTable = pgTable("categories", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: varchar("name", {
    length: 255,
  })
    .unique()
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const categorySchema = createSelectSchema(categoriesTable);

export type Category = UnwrapSchema<typeof categorySchema>;
