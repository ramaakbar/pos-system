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

import { generateCode } from "@/server/lib/utils";

import { categoriesTable, categorySchema } from "./categories";

export const productsTable = pgTable("products", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: varchar("code", { length: 125 })
    .unique()
    .$defaultFn(() => generateCode("PRD")),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  media: varchar("media", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const productSchema = t.Object({
  ...createSelectSchema(productsTable).properties,
  category: categorySchema,
});

export const returningProductSchema = t.Object({
  ...createSelectSchema(productsTable).properties,
});

export type Product = UnwrapSchema<typeof productSchema>;
