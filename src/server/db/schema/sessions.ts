import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 255,
  })
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
