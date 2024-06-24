import { sql } from "drizzle-orm";
import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { categoriesTable } from "./categories";

export const productsTable = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  categoryId: int("category_id")
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

export const productSchema = createSelectSchema(productsTable, {
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type Product = z.infer<typeof productSchema>;
