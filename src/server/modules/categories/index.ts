import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { categoriesTable } from "@/server/db/schema/categories";
import { errorResponse } from "@/server/lib/errors";

import defaultHook from "../../lib/default-hook";
import { CustomHono } from "../../types";
import categoriesRoutesConfig from "./routes";

export const categoriesRoute = new CustomHono({
  defaultHook,
})
  .openapi(categoriesRoutesConfig.getCategories, async (ctx) => {
    const categories = await db.select().from(categoriesTable);

    return ctx.json(
      {
        success: true,
        data: categories,
      },
      200
    );
  })
  .openapi(categoriesRoutesConfig.getCategory, async (ctx) => {
    const id = parseInt(ctx.req.valid("param").id);

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));

    if (!category) return errorResponse(ctx, 400, "Category not found");

    return ctx.json(
      {
        success: true,
        data: category,
      },
      200
    );
  });
