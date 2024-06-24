import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const categoriesTable = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
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

export const categorySchema = createSelectSchema(categoriesTable, {
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type Category = z.infer<typeof categorySchema>;
