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

export const usersTable = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: text("role", {
    enum: ["Admin", "Member"],
  })
    .default("Member")
    .notNull(),
  refreshTokenVersion: integer("refresh_token_version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const userSchema = createSelectSchema(usersTable).omit({
  password: true,
});

export type User = z.infer<typeof userSchema>;
