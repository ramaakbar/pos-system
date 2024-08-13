import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string(),
});

export const paginationQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.string().default("createdAt.asc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});
