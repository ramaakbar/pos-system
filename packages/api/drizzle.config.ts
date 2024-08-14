import { type Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  breakpoints: true,
  dbCredentials: {
    url: env.DB_URL,
  },
} satisfies Config;
