import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnvs = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DB_URL: z.string().default("postgres://postgres:@localhost:5432/pos"),
    REFRESH_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    DRIVE_DISK: z.enum(["fs", "r2"]).default("fs"),
    R2_ACCESS_KEY: z.string().optional(),
    R2_ACCESS_SECRET: z.string().optional(),
    R2_ENDPOINT: z.string().optional(),
    R2_SUBDOMAIN: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type ServerEnvs = typeof serverEnvs;
