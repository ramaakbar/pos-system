import { z } from "@hono/zod-openapi";

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
  page: z
    .string()
    .optional()
    .pipe(z.coerce.number().default(1))
    .openapi({ type: "integer" }),
  limit: z
    .string()
    .optional()
    .pipe(z.coerce.number().default(30))
    .openapi({ type: "integer" }),
});
