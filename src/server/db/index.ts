import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnvs } from "@/env/server";

import { sessionsTable } from "./schema/sessions";
import { usersTable } from "./schema/users";

const connection = postgres(serverEnvs.DB_URL, {
  prepare: true,
});

export const db = drizzle(connection, {
  schema: { usersTable, sessionsTable },
});
