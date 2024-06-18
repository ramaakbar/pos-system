import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

import { serverEnvs } from "@/env/server";

import { sessionsTable } from "./schema/sessions";
import { usersTable } from "./schema/users";

const connection = createPool({
  host: serverEnvs.DB_HOST,
  port: serverEnvs.DB_PORT,
  user: serverEnvs.DB_USER,
  database: serverEnvs.DB_DATABASE,
});

export const db = drizzle(connection, {
  schema: { usersTable, sessionsTable },
  mode: "default",
});
