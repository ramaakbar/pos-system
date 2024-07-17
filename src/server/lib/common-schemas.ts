import { t } from "elysia";

export const idParamSchema = t.Object({
  id: t.String({
    error: "Invalid id param",
  }),
});

export const paginationQuerySchema = t.Partial(
  t.Object({
    search: t.String(),
    sort: t.Union([t.Literal("createdAt")]),
    order: t.Union([t.Literal("asc"), t.Literal("desc")]),
    page: t.Number({
      minimum: 0,
    }),
    limit: t.Number({
      minimum: 0,
    }),
  })
);
