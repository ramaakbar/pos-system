import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnvs = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DB_HOST: z.string().default("127.0.0.1"),
    DB_PORT: z.preprocess(Number, z.number()).default(3306),
    DB_USER: z.string().default("user"),
    DB_DATABASE: z.string().default("pos"),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type ServerEnvs = typeof serverEnvs;
