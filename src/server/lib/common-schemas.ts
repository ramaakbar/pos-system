import { z } from "zod";

export const errorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: errorSchema,
});

export const paginationQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["createdAt"]).default("createdAt").optional(),
  order: z.enum(["asc", "desc"]).default("asc").optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(30),
});
