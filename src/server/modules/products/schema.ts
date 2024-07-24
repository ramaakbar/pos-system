import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

import { productsTable } from "@/server/db/schema/products";
import { paginationQuerySchema } from "@/server/lib/common-schemas";

const insertSchema = createInsertSchema(productsTable, {
  name: t.String({}),
  categoryId: t.String(),
  price: t.Numeric({
    minimum: 1,
  }),
  quantity: t.Numeric(),
  media: t.File({
    maxSize: 2000000,
    type: ["image"],
  }),
});

export const createProductDtoSchema = t.Omit(insertSchema, [
  "createdAt",
  "updatedAt",
]);

export const updateProductDtoSchema = t.Partial(createProductDtoSchema);

export const getProductQuerySchema = t.Object({
  ...paginationQuerySchema.properties,
  category: t.Optional(t.String()),
});
