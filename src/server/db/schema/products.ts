import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { ulid } from "ulid";
import { z } from "zod";

import { generateCode } from "@/server/lib/utils";

import { categoriesTable, categorySchema } from "./categories";

export const productsTable = pgTable("products", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: varchar("code", { length: 125 })
    .unique()
    .$defaultFn(() => generateCode("PRD"))
    .notNull(),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categoriesTable.id),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
  media: varchar("media", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
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

export const productSchema = z.object({
  ...createSelectSchema(productsTable).shape,
  category: categorySchema,
});

export type Product = z.infer<typeof productSchema>;
export type tesasd = typeof productsTable.$inferSelect;
