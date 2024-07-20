import { asc, count, desc, eq, getTableColumns, ilike, SQL } from "drizzle-orm";
import Elysia from "elysia";

import { db } from "@/server/db";
import { categoriesTable } from "@/server/db/schema/categories";
import { customersTable } from "@/server/db/schema/customers";
import { productsTable } from "@/server/db/schema/products";
import {
  detailTransactionsTable,
  headerTransactionsTable,
  transactionHeaderSchema,
  transactionSchema,
} from "@/server/db/schema/transactions";
import {
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
  successResponseWithPaginationSchema,
} from "@/server/lib/common-responses";
import {
  idParamSchema,
  paginationQuerySchema,
} from "@/server/lib/common-schemas";
import { disk } from "@/server/lib/flydrive";
import { jsonBuildObject } from "@/server/lib/utils";
import { ctx } from "@/server/plugins/context";

import {
  createTransactionDtoSchema,
  updateTransactionStatusDtoSchema,
} from "./schema";

export const transactionsRoutes = new Elysia({
  prefix: "/transactions",
  detail: {
    tags: ["Transaction"],
  },
})
  .use(ctx)
  .guard({
    isAuth: true,
    isAdmin: true,
  })
  .get(
    "/",
    async ({ query, set }) => {
      const { search, sort, order, page = 1, limit = 10 } = query;

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
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = params.id;

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
        .innerJoin(
          customersTable,
          eq(headerTransactionsTable.customerId, customersTable.id)
        )
        .where(eq(headerTransactionsTable.id, id));

      if (!transactionHeader) {
        set.status = "Bad Request";
        throw new Error("Transaction not found");
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
        .where(eq(detailTransactionsTable.transactionId, id));

      for (const dt of transactionDetail) {
        dt.product.media = await disk.getUrl(dt.product.media);
      }

      const transaction = {
        ...transactionHeader,
        detail: transactionDetail,
      };

      return {
        success: true,
        data: transaction,
      };
    },
    {
      params: idParamSchema,
      response: {
        200: successResponseWithDataSchema(transactionSchema),
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
              code: productsTable.code,
            })
            .from(productsTable)
            .where(eq(productsTable.id, val.productId));

          if (product.quantity < val.quantity) {
            set.status = "Bad Request";
            throw new Error(
              `Insufficient stock for product ${product.code} - ${product.name}`
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

        let [customer] = await tx
          .select()
          .from(customersTable)
          .where(ilike(customersTable.name, body.customer));

        if (!customer) {
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
            customerId: customer.id,
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
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const id = params.id;
      const { transactionStatus, paymentStatus } = body;

      let [transactionHeader] = await db
        .select()
        .from(headerTransactionsTable)

        .where(eq(headerTransactionsTable.id, id));

      if (!transactionHeader) {
        set.status = "Bad Request";
        throw new Error("Transaction not found");
      }

      await db
        .update(headerTransactionsTable)
        .set({
          transactionStatus,
          paymentStatus,
        })
        .where(eq(headerTransactionsTable.id, id))
        .returning();

      return {
        success: true,
      };
    },
    {
      params: idParamSchema,
      body: updateTransactionStatusDtoSchema,
      response: {
        200: successResponseWithoutDataSchema,
      },
    }
  );
