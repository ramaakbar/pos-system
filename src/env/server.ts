import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnvs = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DB_URL: z.string().default("postgres://postgres:@localhost:5432/pos"),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type ServerEnvs = typeof serverEnvs;
