import { randomUUID } from "crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  SQL,
} from "drizzle-orm";
import Elysia from "elysia";

import { db } from "@/server/db";
import { categoriesTable } from "@/server/db/schema/categories";
import {
  Product,
  productSchema,
  productsTable,
  returningProductSchema,
} from "@/server/db/schema/products";
import {
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
  successResponseWithPaginationSchema,
} from "@/server/lib/common-responses";
import { idParamSchema } from "@/server/lib/common-schemas";
import { disk } from "@/server/lib/flydrive";
import { ctx } from "@/server/plugins/context";

import {
  createProductDtoSchema,
  getProductQuerySchema,
  updateProductDtoSchema,
} from "./schema";

export const productsRoutes = new Elysia({
  prefix: "/products",
  detail: {
    tags: ["Product"],
  },
})
  .use(ctx)
  .get(
    "/",
    async ({ query, set }) => {
      const {
        search,
        sort = "createdAt.asc",
        page = 1,
        limit = 20,
        category,
      } = query;

      const [sortBy, sortOrder] = (sort?.split(".").filter(Boolean) ?? [
        "createdAt",
        "desc",
      ]) as [keyof Omit<Product, "category">, "asc" | "desc"];

      const filter: Array<SQL> = [];

      if (search) filter.push(ilike(productsTable.name, `%${search}%`));
      if (category) filter.push(ilike(categoriesTable.name, `%${category}%`));

      const where = filter.length > 0 ? and(...filter) : undefined;

      const [{ total }] = await db
        .select({ total: count() })
        .from(productsTable)
        .innerJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id)
        )
        .where(where);

      const pageCount = Math.ceil(total / Number(limit));

      if (total === 0) {
        return {
          success: true,
          pagination: {
            total: total,
            pageCount: pageCount,
            currentPage: 0,
            perPage: limit,
            from: 0,
            to: 0,
          },
          data: [],
        };
      }

      if (page === 0 || page > pageCount) {
        set.status = "Bad Request";
        throw new Error("Invalid page");
      }

      const products = await db
        .select({
          id: productsTable.id,
          code: productsTable.code,
          categoryId: productsTable.categoryId,
          name: productsTable.name,
          description: productsTable.description,
          media: productsTable.media,
          price: productsTable.price,
          quantity: productsTable.quantity,
          category: getTableColumns(categoriesTable),
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .innerJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id)
        )
        .where(where)
        .limit(limit)
        .offset(limit * (page - 1))
        .orderBy(
          sortOrder.toUpperCase() === "DESC"
            ? desc(productsTable[sortBy])
            : asc(productsTable[sortBy])
        );

      for (const product of products) {
        product.media = await disk.getUrl(product.media);
      }

      return {
        success: true,
        pagination: {
          total: total,
          pageCount: pageCount,
          currentPage: page,
          perPage: limit,
          from: (page - 1) * limit + 1,
          to: (page - 1) * limit + products.length,
        },
        data: products,
      };
    },
    {
      query: getProductQuerySchema,
      response: {
        200: successResponseWithPaginationSchema(productSchema),
      },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = params.id;

      const [product] = await db
        .select({
          id: productsTable.id,
          code: productsTable.code,
          categoryId: productsTable.categoryId,
          name: productsTable.name,
          description: productsTable.description,
          media: productsTable.media,
          price: productsTable.price,
          quantity: productsTable.quantity,
          category: categoriesTable,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .innerJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id)
        )
        .where(eq(productsTable.id, id));

      if (!product) {
        set.status = "Bad Request";
        throw new Error("Product not found");
      }

      product.media = await disk.getUrl(product.media);

      return {
        success: true,
        data: product,
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseWithDataSchema(productSchema),
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
      const { name, categoryId, price, quantity, description, media } = body;

      const [productFound] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.name, name));

      if (productFound) {
        set.status = "Bad Request";
        throw new Error("Product already exists with the name");
      }

      let saveImage = "";

      if (media instanceof File) {
        saveImage = `${randomUUID()}.${media?.name.split(".")[1]}`;

        await disk.put(
          saveImage,
          await Bun.readableStreamToBytes(media.stream())
        );
      }

      const [product] = await db
        .insert(productsTable)
        .values({
          name,
          categoryId,
          price,
          quantity,
          description,
          media: saveImage,
        })
        .returning({
          id: productsTable.id,
          code: productsTable.code,
          categoryId: productsTable.categoryId,
          name: productsTable.name,
          description: productsTable.description,
          media: productsTable.media,
          price: productsTable.price,
          quantity: productsTable.quantity,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        });

      return {
        success: true,
        data: product,
      };
    },
    {
      body: createProductDtoSchema,
      response: {
        200: successResponseWithDataSchema(returningProductSchema),
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, set, user }) => {
      const id = params.id;
      const { name, categoryId, price, quantity, description, media } = body;

      const [productFound] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));

      if (!productFound) {
        set.status = "Bad Request";
        throw new Error("Product not found");
      }

      let saveImage = productFound.media;

      if (media instanceof File) {
        if (saveImage) await disk.delete(saveImage);
        saveImage = `${randomUUID()}.${media?.name.split(".")[1]}`;

        await disk.put(
          saveImage,
          await Bun.readableStreamToBytes(media.stream())
        );
      }

      const [product] = await db
        .update(productsTable)
        .set({
          name,
          categoryId,
          price,
          quantity,
          description,
          media: saveImage,
        })
        .where(eq(productsTable.id, id))
        .returning({
          id: productsTable.id,
          code: productsTable.code,
          categoryId: productsTable.categoryId,
          name: productsTable.name,
          description: productsTable.description,
          media: productsTable.media,
          price: productsTable.price,
          quantity: productsTable.quantity,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        });

      return {
        success: true,
        data: product,
      };
    },
    {
      params: idParamSchema,
      body: updateProductDtoSchema,
      response: {
        200: successResponseWithDataSchema(returningProductSchema),
      },
    }
  ) //TEMP routing for update stock
  .patch(
    "/stock/:id",
    async ({ params, body, set, user }) => {
      const { quantity } = body;

      const [product] = await db
        .update(productsTable)
        .set({
          quantity,
        })
        .where(eq(productsTable.id, params.id))
        .returning({
          id: productsTable.id,
          code: productsTable.code,
          categoryId: productsTable.categoryId,
          name: productsTable.name,
          description: productsTable.description,
          media: productsTable.media,
          price: productsTable.price,
          quantity: productsTable.quantity,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        });

      return {
        success: true,
        data: product,
      };
    },
    {
      params: idParamSchema,
      body: updateProductDtoSchema,
      response: {
        200: successResponseWithDataSchema(returningProductSchema),
      },
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const [product] = await db
        .delete(productsTable)
        .where(eq(productsTable.id, params.id))
        .returning({
          id: productsTable.id,
          media: productsTable.media,
        });

      await disk.delete(product.media);

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
