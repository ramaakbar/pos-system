import { sql } from "drizzle-orm";
import {
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["Admin", "Member"]).default("Member").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const userSchema = createSelectSchema(usersTable, {
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
}).omit({
  password: true,
});

export type User = z.infer<typeof userSchema>;
