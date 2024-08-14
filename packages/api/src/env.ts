import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BACKEND_URL: z.string().default("localhost:3001"),
    FRONTEND_URL: z.string().default("localhost:3000"),
    DOMAIN: z.string().optional(),
    DB_URL: z.string().default("postgres://postgres:@localhost:5432/pos"),
    PORT: z.coerce.number().default(3001),
    REFRESH_TOKEN_SECRET: z.string().optional(),
    ACCESS_TOKEN_SECRET: z.string().optional(),
    DRIVE_DISK: z.enum(["fs", "r2"]).default("fs"),
    R2_ACCESS_KEY: z.string().optional(),
    R2_ACCESS_SECRET: z.string().optional(),
    R2_ENDPOINT: z.string().optional(),
    R2_SUBDOMAIN: z.string().optional(),
  })
  .parse(process.env);
