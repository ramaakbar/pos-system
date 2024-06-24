import { createRoute, z } from "@hono/zod-openapi";

import { errorResponseSchema, errorSchema } from "./common-schemas";

type Responses = Parameters<typeof createRoute>[0]["responses"];

export const successResponseWithoutDataSchema = z.object({
  success: z.boolean(),
});

export const successResponseWithDataSchema = <T extends z.ZodTypeAny>(
  schema: T
) => z.object({ success: z.boolean(), data: schema });

export const successResponseWithPaginationSchema = <T extends z.ZodTypeAny>(
  schema: T
) =>
  z.object({
    success: z.boolean(),
    pagination: z.object({
      total: z.number(),
      pageCount: z.number(),
      currentPage: z.number(),
      perPage: z.number(),
      from: z.number(),
      to: z.number(),
    }),
    data: schema.array(),
  });

export const successResponseWithErrorsSchema = () =>
  z.object({
    success: z.boolean(),
    errors: z.array(errorSchema),
  });

export const errorResponses = {
  400: {
    description: "Bad request: problem processing request.",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  401: {
    description: "Unauthorized: authentication required.",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  403: {
    description: "Forbidden: insufficient permissions.",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  404: {
    description: "Not found: resource does not exist.",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  500: {
    description: "Server error: something went wrong.",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
} satisfies Responses;
