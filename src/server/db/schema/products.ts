import { sql } from "drizzle-orm";
import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-typebox";
import { t, UnwrapSchema } from "elysia";
import { ulid } from "ulid";

import { categoriesTable } from "./categories";

export const productsTable = mysqlTable("products", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  media: varchar("media", { length: 255 }),
  price: int("price").notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const productSchema = t.Object({
  ...createSelectSchema(productsTable).properties,
  categoryName: t.String(),
});

export type Product = UnwrapSchema<typeof productSchema>;
