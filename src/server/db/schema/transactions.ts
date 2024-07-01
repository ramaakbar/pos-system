import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";
import { t, UnwrapSchema } from "elysia";
import { ulid } from "ulid";

import { customerSchema, customersTable } from "./customers";
import { productSchema, productsTable } from "./products";

export const headerTransactionsTable = pgTable("headerTransactions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  customerId: varchar("customer_id", { length: 255 }).references(
    () => customersTable.id
  ),
  status: text("status", {
    enum: ["waiting for payment", "paid", "done"],
  }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["cash", "transfer", "qris"],
  }).notNull(),
  amount: integer("amount").notNull(),
  address: varchar("address", {
    length: 255,
  }),
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
});

export const detailTransactionsTable = pgTable("detailTransactions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  transactionId: varchar("transaction_id", { length: 255 })
    .notNull()
    .references(() => headerTransactionsTable.id),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => productsTable.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("modified_at").defaultNow().notNull(),
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
