import { and, asc, desc, eq, ilike, SQL } from "drizzle-orm";
import Elysia, { t } from "elysia";

import { db } from "@/server/db";
import {
  categoriesTable,
  Category,
  categorySchema,
} from "@/server/db/schema/categories";
import {
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
} from "@/server/lib/common-responses";
import {
  idParamSchema,
  paginationQuerySchema,
} from "@/server/lib/common-schemas";
import { ctx } from "@/server/plugins/context";

import {
  checkDuplicateFieldValue,
  checkRecordExistsById,
} from "../common/service";
import { createCategoryDtoSchema } from "./schema";

export const categoriesRoute = new Elysia({
  prefix: "/categories",
  detail: {
    tags: ["Categories"],
  },
})
  .use(ctx)
  .get(
    "/",
    async ({ query }) => {
      const { search, sort = "createdAt.asc" } = query;

      const [sortBy, sortOrder] = (sort?.split(".").filter(Boolean) ?? [
        "createdAt",
        "desc",
      ]) as [keyof Category, "asc" | "desc"];

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

      return {
        success: true,
        data: categories,
      };
    },
    {
      query: paginationQuerySchema,
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
  )
  .guard({
    isAuth: true,
    isAdmin: true,
  })
  .post(
    "/",
    async ({ body, set }) => {
      const { name } = body;

      const [categoryFound] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.name, name));

      if (categoryFound) {
        set.status = "Bad Request";
        throw new Error("Category already exists with the name");
      }

      const [category] = await db
        .insert(categoriesTable)
        .values({
          name,
        })
        .returning();

      return {
        success: true,
        data: category,
      };
    },
    {
      body: createCategoryDtoSchema,
      response: {
        200: successResponseWithDataSchema(categorySchema),
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const id = params.id;
      const { name } = body;

      const categoryFoundById = await checkRecordExistsById(
        categoriesTable,
        id
      );
      if (!categoryFoundById) {
        set.status = "Bad Request";
        throw new Error("Category not found");
      }

      const categoryFoundByName = await checkDuplicateFieldValue(
        categoriesTable,
        categoriesTable.name,
        name
      );
      if (categoryFoundByName) {
        set.status = "Bad Request";
        throw new Error("Category already exists with the name");
      }

      const [category] = await db
        .update(categoriesTable)
        .set({
          name: name,
        })
        .where(eq(categoriesTable.id, id))
        .returning();

      return {
        success: true,
        data: category,
      };
    },
    {
      params: idParamSchema,
      body: createCategoryDtoSchema,
      response: {
        200: successResponseWithDataSchema(categorySchema),
      },
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, params.id));

      return {
        success: true,
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseWithoutDataSchema,
      },
    }
  );
