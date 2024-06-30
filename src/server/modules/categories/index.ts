import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { db } from "@/server/db";
import { categoriesTable, categorySchema } from "@/server/db/schema/categories";
import { successResponseWithDataSchema } from "@/server/lib/common-responses";
import { idParamSchema } from "@/server/lib/common-schemas";
import { ctx } from "@/server/plugins/context";

export const categoriesRoute = new Elysia({
  prefix: "/categories",
  detail: {
    tags: ["Categories"],
  },
})
  .use(ctx)
  .get(
    "/",
    async (ctx) => {
      const categories = await db.select().from(categoriesTable);

      return {
        success: true,
        data: categories,
      };
    },
    {
      response: {
        200: successResponseWithDataSchema(t.Array(categorySchema)),
      },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = params.id;

      const [category] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, id));

      if (!category) {
        set.status = "Bad Request";
        throw new Error("Category not found");
      }

      return {
        success: true,
        data: category,
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseWithDataSchema(categorySchema),
      },
    }
  );
