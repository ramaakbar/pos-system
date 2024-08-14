import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BACKEND_URL: z.string().default("localhost:3001"),
    NEXT_PUBLIC_DOMAIN: z.string().default("localhost:3000"),
    PORT: z.coerce.number().default(3001),
  })
  .parse(process.env);
