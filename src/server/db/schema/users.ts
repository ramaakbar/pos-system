import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";
import { t, UnwrapSchema } from "elysia";

export const usersTable = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: text("role", {
    enum: ["Admin", "Member"],
  })
    .default("Member")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

const userSchemaTemp = createSelectSchema(usersTable);

export const userSchema = t.Omit(userSchemaTemp, ["password"]);

export type User = UnwrapSchema<typeof userSchema>;
