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

const userSchemaTemp = createSelectSchema(usersTable);

export const userSchema = t.Omit(userSchemaTemp, ["password"]);

export type User = UnwrapSchema<typeof userSchema>;
