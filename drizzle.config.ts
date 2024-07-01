import { type Config } from "drizzle-kit";

import { serverEnvs } from "@/env/server";

export default {
  schema: "./src/server/db/schema/*",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  breakpoints: true,
  dbCredentials: {
    url: serverEnvs.DB_URL,
  },
} satisfies Config;
