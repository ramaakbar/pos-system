import { z } from "zod";

export const errorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: errorSchema,
});
