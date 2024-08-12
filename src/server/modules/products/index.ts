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
import { Hono } from "hono";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";

import { Env } from "@/server";
import { db } from "@/server/db";
import { categoriesTable } from "@/server/db/schema/categories";
import { Product, productsTable } from "@/server/db/schema/products";
import { idParamSchema } from "@/server/lib/common-schemas";
import { disk } from "@/server/lib/flydrive";
import { validator } from "@/server/lib/utils";
import { adminGuard, authGuard } from "@/server/middlewares/auth";

import {
  createProductDtoSchema,
  getProductQuerySchema,
  updateProductDtoSchema,
} from "./schema";

export const productRoutes = new Hono<Env>()
  .get("/", validator("query", getProductQuerySchema), async (ctx) => {
    const { search, sort, page, limit, category } = ctx.req.valid("query");

    const [sortBy, sortOrder] = sort.split(".").filter(Boolean) as [
      keyof Omit<Product, "category">,
      "asc" | "desc",
    ];

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

    if (total === 0 || page === 0 || page > pageCount) {
      return ctx.json(
        {
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
        },
        200
      );
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

    return ctx.json(
      {
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
      },
      200
    );
  })
  .get("/:id", validator("param", idParamSchema), async (ctx) => {
    const param = ctx.req.valid("param");

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
      .where(eq(productsTable.id, param.id));

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    product.media = await disk.getUrl(product.media);

    return ctx.json({
      success: true,
      data: product,
    });
  })
  .use(every(authGuard, adminGuard))
  .post("/", validator("form", createProductDtoSchema), async (ctx) => {
    const { name, categoryId, price, quantity, description, media } =
      ctx.req.valid("form");

    const [productFound] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.name, name));

    if (productFound) {
      throw new HTTPException(400, {
        message: "Product name is already used",
      });
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

    return ctx.json({
      success: true,
      data: product,
    });
  })
  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("form", updateProductDtoSchema),
    async (ctx) => {
      const param = ctx.req.valid("param");
      const { name, categoryId, price, quantity, description, media } =
        ctx.req.valid("form");

      const [productFound] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, param.id));

      if (!productFound) {
        throw new HTTPException(404, { message: "Product not found" });
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
        .where(eq(productsTable.id, param.id))
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

      return ctx.json({
        sucess: true,
        data: product,
      });
    }
  )
  .patch(
    "/stock/:id",
    validator("param", idParamSchema),
    validator("form", updateProductDtoSchema),
    async (ctx) => {
      const param = ctx.req.valid("param");
      const { quantity } = ctx.req.valid("form");

      const [productFound] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, param.id));

      if (!productFound) {
        throw new HTTPException(404, { message: "Product not found" });
      }

      const [product] = await db
        .update(productsTable)
        .set({
          quantity,
        })
        .where(eq(productsTable.id, param.id))
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

      return ctx.json({
        success: true,
        data: product,
      });
    }
  )
  .delete("/:id", validator("param", idParamSchema), async (ctx) => {
    const param = ctx.req.valid("param");

    const [productFound] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, param.id));

    if (!productFound) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    const [product] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, param.id))
      .returning({
        id: productsTable.id,
        media: productsTable.media,
      });

    await disk.delete(product.media);

    return ctx.json({
      success: true,
    });
  });
