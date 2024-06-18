import { datetime, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { usersTable } from "./users";

export const sessionsTable = mysqlTable("sessions", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 255,
  })
    .notNull()
    .references(() => usersTable.id),
  expiresAt: datetime("expires_at").notNull(),
});
