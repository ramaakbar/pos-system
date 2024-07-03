import { asc, count, desc, eq } from "drizzle-orm";
import Elysia from "elysia";

import { db } from "@/server/db";
import { customersTable } from "@/server/db/schema/customers";
import { productsTable } from "@/server/db/schema/products";
import {
  detailTransactionsTable,
  headerTransactionsTable,
  transactionHeaderSchema,
} from "@/server/db/schema/transactions";
import {
  successResponseWithoutDataSchema,
  successResponseWithPaginationSchema,
} from "@/server/lib/common-responses";
import { paginationQuerySchema } from "@/server/lib/common-schemas";
import { ctx } from "@/server/plugins/context";

import { createTransactionDtoSchema } from "./schema";

export const transactionsRoutes = new Elysia({
  prefix: "/transactions",
  detail: {
    tags: ["Transaction"],
  },
})
  .use(ctx)
  .get(
    "/",
    async ({ query, set }) => {
      const { search, sort, order, page = 1, limit = 20 } = query;

      const [{ total }] = await db
        .select({ total: count() })
        .from(headerTransactionsTable);

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

      const transactions = await db
        .select({
          id: headerTransactionsTable.id,
          status: headerTransactionsTable.status,
          paymentMethod: headerTransactionsTable.paymentMethod,
          amount: headerTransactionsTable.amount,
          address: headerTransactionsTable.address,
          date: headerTransactionsTable.date,
          customerId: headerTransactionsTable.customerId,
          customer: customersTable,
          createdAt: headerTransactionsTable.createdAt,
          updatedAt: headerTransactionsTable.updatedAt,
        })
        .from(headerTransactionsTable)
        .leftJoin(
          customersTable,
          eq(headerTransactionsTable.customerId, customersTable.id)
        )
        .limit(limit)
        .offset(limit * (page - 1))
        .orderBy(
          order?.toUpperCase() === "DESC"
            ? desc(headerTransactionsTable[sort ?? "createdAt"])
            : asc(headerTransactionsTable[sort ?? "createdAt"])
        );

      return {
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
      };
    },
    {
      query: paginationQuerySchema,
      response: {
        200: successResponseWithPaginationSchema(transactionHeaderSchema),
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
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
            })
            .from(productsTable)
            .where(eq(productsTable.id, val.productId));

          if (product.quantity < val.quantity) {
            throw new Error(
              `Insufficient stock for product ${val.productId} - ${product.name}`
            );
          }

          await tx
            .update(productsTable)
            .set({
              quantity: product.quantity - val.quantity,
            })
            .where(eq(productsTable.id, val.productId));
        });

        await Promise.all(stockCheckPromises);

        const [{ id }] = await tx
          .insert(headerTransactionsTable)
          .values({
            customerId: body.customerId,
            status: body.status,
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

      return {
        success: true,
      };
    },
    {
      body: createTransactionDtoSchema,
      response: {
        200: successResponseWithoutDataSchema,
      },
    }
  );