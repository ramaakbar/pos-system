import { sql } from "drizzle-orm";
import {
  date,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-typebox";
import { t, UnwrapSchema } from "elysia";
import { ulid } from "ulid";

import { customerSchema, customersTable } from "./customers";
import { productSchema, productsTable } from "./products";

export const headerTransactionsTable = mysqlTable("headerTransactions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  customerId: varchar("customer_id", { length: 255 }).references(
    () => customersTable.id
  ),
  status: mysqlEnum("status", [
    "waiting for payment",
    "paid",
    "done",
  ]).notNull(),
  paymentMethod: mysqlEnum("payment_method", [
    "cash",
    "transfer",
    "qris",
  ]).notNull(),
  amount: int("amount").notNull(),
  address: varchar("address", {
    length: 255,
  }),
  date: date("date"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const detailTransactionsTable = mysqlTable("detailTransactions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  transactionId: varchar("transaction_id", { length: 255 })
    .notNull()
    .references(() => headerTransactionsTable.id),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => productsTable.id),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

export const transactionDetailSchema = t.Object({
  ...createSelectSchema(detailTransactionsTable).properties,
  product: t.Object({ ...productSchema.properties }),
});

export type TransactionDetail = UnwrapSchema<typeof transactionDetailSchema>;

export const transactionHeaderSchema = t.Object({
  ...createSelectSchema(headerTransactionsTable).properties,
  customer: t.Union([customerSchema, t.Null()]),
});

export type TransactionHeader = UnwrapSchema<typeof transactionHeaderSchema>;
