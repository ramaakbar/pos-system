import { and, asc, desc, eq, ilike, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";

import { Env } from "../..";
import { db } from "../../db";
import { categoriesTable, Category } from "../../db/schema/categories";
import { idParamSchema, paginationQuerySchema } from "../../lib/common-schemas";
import { validator } from "../../lib/utils";
import { adminGuard, authGuard } from "../../middlewares/auth";
import {
  checkDuplicateFieldValue,
  checkRecordExistsById,
} from "../common/service";
import { createCategoryDtoSchema } from "./schema";

export const categoriesRoutes = new Hono<Env>()
  .get("/", validator("query", paginationQuerySchema), async (ctx) => {
    const { search, sort } = ctx.req.valid("query");

    const [sortBy, sortOrder] = sort.split(".").filter(Boolean) as [
      keyof Category,
      "asc" | "desc",
    ];

    const filter: Array<SQL> = [];

    if (search) filter.push(ilike(categoriesTable.name, `%${search}%`));

    const where = filter.length > 0 ? and(...filter) : undefined;

    const categories = await db
      .select()
      .from(categoriesTable)
      .where(where)
      // .limit(limit)
      // .offset(limit * (page - 1))
      .orderBy(
        sortOrder.toUpperCase() === "DESC"
          ? desc(categoriesTable[sortBy])
          : asc(categoriesTable[sortBy])
      );

    return ctx.json({ success: true, data: categories }, 200);
  })
  .get("/:id", validator("param", idParamSchema), async (ctx) => {
    const param = ctx.req.valid("param");

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, param.id));

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    return ctx.json({ data: category }, 200);
  })
  .use(every(authGuard, adminGuard))
  .post("/", validator("json", createCategoryDtoSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const [categoryFound] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.name, body.name));

    if (categoryFound) {
      throw new HTTPException(400, {
        message: "Category already exists with the name",
      });
    }

    const [category] = await db
      .insert(categoriesTable)
      .values({
        name: body.name,
      })
      .returning();

    return ctx.json({ success: true, data: category }, 200);
  })
  .delete("/:id", validator("param", idParamSchema), async (ctx) => {
    const param = ctx.req.valid("param");

    const categoryFoundById = await checkRecordExistsById(
      categoriesTable,
      param.id
    );
    if (!categoryFoundById) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    await db.delete(categoriesTable).where(eq(categoriesTable.id, param.id));

    return ctx.json({ success: true }, 200);
  })

  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("json", createCategoryDtoSchema),
    async (ctx) => {
      const param = ctx.req.valid("param");
      const body = ctx.req.valid("json");

      const categoryFoundById = await checkRecordExistsById(
        categoriesTable,
        param.id
      );
      if (!categoryFoundById) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      const categoryFoundByName = await checkDuplicateFieldValue(
        categoriesTable,
        categoriesTable.name,
        body.name
      );
      if (categoryFoundByName) {
        throw new HTTPException(400, {
          message: "Category already exists with the name",
        });
      }

      const [category] = await db
        .update(categoriesTable)
        .set({
          name: body.name,
        })
        .where(eq(categoriesTable.id, param.id))
        .returning();

      return ctx.json({ success: true, data: category }, 200);
    }
  );
