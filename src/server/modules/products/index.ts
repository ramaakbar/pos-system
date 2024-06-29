import { randomUUID } from "crypto";
import { asc, count, desc, eq, ilike, SQL } from "drizzle-orm";
import Elysia from "elysia";

import { db } from "@/server/db";
import { productSchema, productsTable } from "@/server/db/schema/products";
import {
  successResponseWithDataSchema,
  successResponseWithPaginationSchema,
} from "@/server/lib/common-responses";
import {
  idParamSchema,
  paginationQuerySchema,
} from "@/server/lib/common-schemas";
import { disk } from "@/server/lib/flydrive";
import { ctx } from "@/server/plugins/context";

import { createProductDtoSchema, updateProductDtoSchema } from "./schema";

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
      const { search, sort, order, page = 1, limit = 20 } = query;

      const filter: SQL | undefined = search
        ? ilike(productsTable.name, `%${search}%`)
        : undefined;

      const productsQuery = db.select().from(productsTable).where(filter);

      const [{ total }] = await db
        .select({ total: count() })
        .from(productsQuery.as("products"));

      const pageCount = Math.ceil(total / Number(limit));

      if (page === 0 || page > pageCount) {
        set.status = "Bad Request";
        throw new Error("Invalid page");
      }

      const products = await db
        .select()
        .from(productsQuery.as("products"))
        .limit(limit)
        .offset(limit * (page - 1))
        .orderBy(
          order?.toUpperCase() === "DESC"
            ? desc(productsTable[sort ?? "createdAt"])
            : asc(productsTable[sort ?? "createdAt"])
        );

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
      query: paginationQuerySchema,
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
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));

      if (!product) {
        set.status = "Bad Request";
        throw new Error("Product not found");
      }

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
        throw new Error("Product not found");
      }

      let saveImage = null;

      if (media instanceof File) {
        saveImage = `${randomUUID()}.${media?.name.split(".")[1]}`;

        await disk.put(
          saveImage,
          await Bun.readableStreamToBytes(media.stream())
        );
      }

      await db.insert(productsTable).values({
        name,
        categoryId,
        price,
        quantity,
        description,
        media: saveImage,
      });

      const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.name, name));

      return {
        success: true,
        data: product,
      };
    },
    {
      body: createProductDtoSchema,
      response: {
        200: successResponseWithDataSchema(productSchema),
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, set, user }) => {
      console.log("product", user);
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

      await db
        .update(productsTable)
        .set({
          name,
          categoryId,
          price,
          quantity,
          description,
          media: saveImage,
        })
        .where(eq(productsTable.id, id));

      const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id));

      return {
        success: true,
        data: product,
      };
    },
    {
      params: idParamSchema,
      body: updateProductDtoSchema,
      response: {
        200: successResponseWithDataSchema(productSchema),
      },
    }
  );
