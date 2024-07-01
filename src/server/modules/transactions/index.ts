import { asc, count, desc, eq } from "drizzle-orm";
import Elysia from "elysia";

import { db } from "@/server/db";
import { customersTable } from "@/server/db/schema/customers";
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
    async ({ body }) => {
      let amountTemp = body.detail.reduce(
        (acc, curr) => (acc = acc + curr.price * curr.quantity),
        0
      );

      await db.transaction(async (tx) => {
        await tx.insert(headerTransactionsTable).values({
          customerId: body.customerId,
          status: body.status,
          paymentMethod: body.paymentMethod,
          amount: amountTemp,
          address: body.address,
          date: body.date,
        });

        body.detail.map(
          async (val) =>
            await db.insert(detailTransactionsTable).values({
              transactionId: "asdsad",
              productId: val.productId,
              quantity: val.quantity,
              price: val.price,
            })
        );
      });

      body.detail.forEach(
        async (val) =>
          await db.insert(detailTransactionsTable).values({
            transactionId: "sadsa",
            productId: val.productId,
            quantity: val.quantity,
            price: val.price,
          })
      );

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
