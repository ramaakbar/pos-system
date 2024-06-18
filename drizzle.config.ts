import { type Config } from "drizzle-kit";

import { serverEnvs } from "@/env/server";

export default {
  schema: "./src/server/db/schema/*",
  out: "./src/server/db/migrations",
  dialect: "mysql",
  breakpoints: true,
  dbCredentials: {
    host: serverEnvs.DB_HOST,
    port: serverEnvs.DB_PORT,
    user: serverEnvs.DB_USER,
    database: serverEnvs.DB_DATABASE,
  },
} satisfies Config;
