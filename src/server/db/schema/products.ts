import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";
import { t, UnwrapSchema } from "elysia";
import { ulid } from "ulid";

import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  media: varchar("media", { length: 255 }),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const productSchema = t.Object({
  ...createSelectSchema(productsTable).properties,
  categoryName: t.String(),
});

export type Product = UnwrapSchema<typeof productSchema>;
