import { randomUUID } from "crypto";
import { and, asc, count, desc, eq, ilike, SQL } from "drizzle-orm";

import { db } from "@/server/db";
import { productsTable } from "@/server/db/schema/products";
import { errorResponse } from "@/server/lib/errors";
import { disk } from "@/server/lib/flydrive";

import defaultHook from "../../lib/default-hook";
import { CustomHono } from "../../types";
import productsRoutesConfig from "./routes";

export const productsRoute = new CustomHono({
  defaultHook,
})
  .openapi(productsRoutesConfig.getProducts, async (ctx) => {
    const { search, sort, order, page, limit } = ctx.req.valid("query");

    const filter: SQL | undefined = search
      ? ilike(productsTable.name, `%${search}%`)
      : undefined;

    const productsQuery = db.select().from(productsTable).where(filter);

    const [{ total }] = await db
      .select({ total: count() })
      .from(productsQuery.as("products"));

    const pageCount = Math.ceil(total / Number(limit));

    if (page === 0 || page > pageCount)
      return errorResponse(ctx, 400, "Invalid page");

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
  .openapi(productsRoutesConfig.getProduct, async (ctx) => {
    const id = parseInt(ctx.req.valid("param").id);

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!product) return errorResponse(ctx, 400, "Product not found");

    return ctx.json(
      {
        success: true,
        data: product,
      },
      200
    );
  })
  .openapi(productsRoutesConfig.createProduct, async (ctx) => {
    const { name, categoryId, price, quantity, description, media } =
      ctx.req.valid("form");

    const [productFound] = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.name, name)));

    if (productFound)
      return errorResponse(ctx, 400, "Product already exists with the name");

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

    return ctx.json(
      {
        success: true,
        data: product,
      },
      200
    );
  })
  .openapi(productsRoutesConfig.updateProduct, async (ctx) => {
    const id = parseInt(ctx.req.valid("param").id);
    const { name, categoryId, price, quantity, description, media } =
      ctx.req.valid("form");

    const [productFound] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!productFound) return errorResponse(ctx, 400, "Product not found");

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

    return ctx.json(
      {
        success: true,
        data: product,
      },
      200
    );
  });
