import { count, eq, getTableColumns, ilike, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";

import { Env } from "../..";
import { db } from "../../db";
import { categoriesTable } from "../../db/schema/categories";
import { customersTable } from "../../db/schema/customers";
import { productsTable } from "../../db/schema/products";
import {
  detailTransactionsTable,
  headerTransactionsTable,
} from "../../db/schema/transactions";
import { idParamSchema, paginationQuerySchema } from "../../lib/common-schemas";
import { disk } from "../../lib/flydrive";
import { jsonBuildObject, validator } from "../../lib/utils";
import { adminGuard, authGuard } from "../../middlewares/auth";
import {
  createTransactionDtoSchema,
  updateTransactionStatusDtoSchema,
} from "./schema";

export const transactionRoutes = new Hono<Env>()
  .use(every(authGuard, adminGuard))
  .get("/", validator("query", paginationQuerySchema), async (ctx) => {
    const { search, sort, page = 1, limit = 10 } = ctx.req.valid("query");

    const filter: SQL | undefined = search
      ? ilike(headerTransactionsTable.code, `%${search}%`)
      : undefined;

    const transactionQuery = db
      .select()
      .from(headerTransactionsTable)
      .where(filter);

    const [{ total }] = await db
      .select({ total: count() })
      .from(transactionQuery.as("transactions"));

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

    const transactions = await db
      .select({
        id: headerTransactionsTable.id,
        code: headerTransactionsTable.code,
        transactionStatus: headerTransactionsTable.transactionStatus,
        paymentStatus: headerTransactionsTable.paymentStatus,
        paymentMethod: headerTransactionsTable.paymentMethod,
        amount: headerTransactionsTable.amount,
        address: headerTransactionsTable.address,
        date: headerTransactionsTable.date,
        customerId: headerTransactionsTable.customerId,
        customer: customersTable,
        createdAt: headerTransactionsTable.createdAt,
        updatedAt: headerTransactionsTable.updatedAt,
      })
      .from(transactionQuery.as("headerTransactions"))
      .leftJoin(
        customersTable,
        eq(headerTransactionsTable.customerId, customersTable.id)
      )
      .limit(limit)
      .offset(limit * (page - 1));
    // .orderBy(
    //   order?.toUpperCase() === "DESC"
    //     ? desc(headerTransactionsTable[sort ?? "createdAt"])
    //     : asc(headerTransactionsTable[sort ?? "createdAt"])
    // );

    return ctx.json(
      {
        success: true,
        pagination: {
          total: total,
          pageCount: pageCount,
          currentPage: page,
          perPage: limit,
          from: (page - 1) * limit + 1,
          to: (page - 1) * limit + transactions.length,
        },
        data: transactions,
      },
      200
    );
  })
  .get("/:id", validator("param", idParamSchema), async (ctx) => {
    const param = ctx.req.valid("param");

    let [transactionHeader] = await db
      .select({
        id: headerTransactionsTable.id,
        code: headerTransactionsTable.code,
        amount: headerTransactionsTable.amount,
        address: headerTransactionsTable.address,
        customerId: headerTransactionsTable.customerId,
        paymentMethod: headerTransactionsTable.paymentMethod,
        paymentStatus: headerTransactionsTable.paymentStatus,
        transactionStatus: headerTransactionsTable.transactionStatus,
        customer: {
          ...getTableColumns(customersTable),
        },
        date: headerTransactionsTable.date,
        createdAt: headerTransactionsTable.createdAt,
        updatedAt: headerTransactionsTable.updatedAt,
      })
      .from(headerTransactionsTable)
      .leftJoin(
        customersTable,
        eq(headerTransactionsTable.customerId, customersTable.id)
      )
      .where(eq(headerTransactionsTable.id, param.id));

    if (!transactionHeader) {
      throw new HTTPException(404, { message: "Transaction not found" });
    }

    const transactionDetail = await db
      .select({
        ...getTableColumns(detailTransactionsTable),
        product: {
          ...getTableColumns(productsTable),
          category: jsonBuildObject({
            ...getTableColumns(categoriesTable),
          }),
        },
      })
      .from(detailTransactionsTable)
      .innerJoin(
        productsTable,
        eq(detailTransactionsTable.productId, productsTable.id)
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .where(eq(detailTransactionsTable.transactionId, param.id));

    for (const dt of transactionDetail) {
      dt.product.media = await disk.getUrl(dt.product.media);
    }

    const transaction = {
      ...transactionHeader,
      detail: transactionDetail,
    };

    return ctx.json(
      {
        success: true,
        data: transaction,
      },
      200
    );
  })
  .post("/", validator("json", createTransactionDtoSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    let amountTemp = body.detail.reduce(
      (acc, curr) => (acc = acc + curr.price * curr.quantity),
      0
    );

    await db.transaction(async (tx) => {
      const stockCheckPromises = body.detail.map(async (val) => {
        const [product] = await tx
          .select({
            quantity: productsTable.quantity,
            name: productsTable.name,
            code: productsTable.code,
          })
          .from(productsTable)
          .where(eq(productsTable.id, val.productId));

        if (product.quantity < val.quantity) {
          throw new HTTPException(400, {
            message: `Insufficient stock for product ${product.code} - ${product.name}`,
          });
        }

        await tx
          .update(productsTable)
          .set({
            quantity: product.quantity - val.quantity,
          })
          .where(eq(productsTable.id, val.productId));
      });

      await Promise.all(stockCheckPromises);

      let customer;
      if (body.customer) {
        [customer] = await tx
          .select()
          .from(customersTable)
          .where(ilike(customersTable.name, body.customer));
      }

      if (!customer && body.customer) {
        [customer] = await tx
          .insert(customersTable)
          .values({
            name: body.customer,
          })
          .returning();
      }

      const [{ id }] = await tx
        .insert(headerTransactionsTable)
        .values({
          customerId: customer ? customer.id : null,
          transactionStatus: body.transactionStatus,
          paymentStatus: body.paymentStatus,
          paymentMethod: body.paymentMethod,
          amount: amountTemp,
          address: body.address,
          date: body.date,
        })
        .returning({
          id: headerTransactionsTable.id,
        });

      await Promise.all(
        body.detail.map(
          async (val) =>
            await tx.insert(detailTransactionsTable).values({
              transactionId: id,
              productId: val.productId,
              quantity: val.quantity,
              price: val.price,
            })
        )
      );
    });

    return ctx.json(
      {
        success: true,
      },
      200
    );
  })
  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("json", updateTransactionStatusDtoSchema),
    async (ctx) => {
      const param = ctx.req.valid("param");
      const body = ctx.req.valid("json");

      let [transactionHeader] = await db
        .select()
        .from(headerTransactionsTable)

        .where(eq(headerTransactionsTable.id, param.id));

      if (!transactionHeader) {
        throw new HTTPException(404, {
          message: "Transaction not found",
        });
      }

      await db
        .update(headerTransactionsTable)
        .set({
          transactionStatus: body.transactionStatus,
          paymentStatus: body.paymentStatus,
        })
        .where(eq(headerTransactionsTable.id, param.id))
        .returning();

      return ctx.json(
        {
          success: true,
        },
        200
      );
    }
  );
