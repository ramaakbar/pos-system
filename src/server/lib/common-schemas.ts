import { t } from "elysia";

export const idParamSchema = t.Object({
  id: t.Numeric(),
});

export const paginationQuerySchema = t.Partial(
  t.Object({
    search: t.String(),
    sort: t.Union([t.Literal("createdAt")]),
    order: t.Union([t.Literal("asc"), t.Literal("desc")]),
    page: t.Numeric(),
    limit: t.Numeric(),
  })
);
