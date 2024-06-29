import { t, TSchema } from "elysia";

export const successResponseWithoutDataSchema = t.Object({
  success: t.Boolean({ default: true }),
});

export const successResponseWithDataSchema = <T extends TSchema>(schema: T) =>
  t.Object({ success: t.Boolean({ default: true }), data: schema });

export const successResponseWithPaginationSchema = <T extends TSchema>(
  schema: T
) =>
  t.Object({
    success: t.Boolean(),
    pagination: t.Object({
      total: t.Number(),
      pageCount: t.Number(),
      currentPage: t.Number(),
      perPage: t.Number(),
      from: t.Number(),
      to: t.Number(),
    }),
    data: t.Array(schema),
  });

export const errorResponseSchema = t.Object({
  success: t.Boolean({ default: false }),
  message: t.String(),
});

export const errorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  403: errorResponseSchema,
  404: errorResponseSchema,
  500: errorResponseSchema,
};
