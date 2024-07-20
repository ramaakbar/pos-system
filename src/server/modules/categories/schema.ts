import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

import { categoriesTable } from "@/server/db/schema/categories";

const insertSchema = createInsertSchema(categoriesTable, {
  name: t.String({
    minLength: 1,
  }),
});

export const createCategoryDtoSchema = insertSchema;

export const updateCategoryDtoSchema = t.Partial(createCategoryDtoSchema);
