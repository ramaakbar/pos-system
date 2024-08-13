import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { ulid } from "ulid";
import { z } from "zod";

import { generateCode } from "@/server/lib/utils";

import { customerSchema, customersTable } from "./customers";
import { productSchema, productsTable } from "./products";

export const transactionStatusEnum = [
  "Canceled",
  "In Progress",
  "Done",
] as const;

export const paymentStatusEnum = ["Not Paid", "Paid"] as const;

export const paymentMethodEnum = ["Cash", "Transfer", "Qris"] as const;

export const headerTransactionsTable = pgTable("headerTransactions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: varchar("code", { length: 125 })
    .unique()
    .$defaultFn(() => generateCode("TX"))
    .notNull(),
  customerId: varchar("customer_id", { length: 255 }).references(
    () => customersTable.id
  ),
  transactionStatus: text("transaction_status", {
    enum: transactionStatusEnum,
  }).notNull(),
  paymentStatus: text("payment_status", {
    enum: paymentStatusEnum,
  }).notNull(),
  paymentMethod: text("payment_method", {
    enum: paymentMethodEnum,
  }).notNull(),
  amount: integer("amount").notNull(),
  address: varchar("address", {
    length: 255,
  }),
  date: timestamp("date", {
    mode: "string",
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("modified_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
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
  createdAt: timestamp("created_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("modified_at", {
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export const transactionDetailSchema = z.object({
  ...createSelectSchema(detailTransactionsTable).shape,
  product: z.object({ ...productSchema.shape }),
});

export type TransactionDetail = z.infer<typeof transactionDetailSchema>;

export const transactionHeaderSchema = z.object({
  ...createSelectSchema(headerTransactionsTable).shape,
  customer: z.union([customerSchema, z.null()]),
});

export type TransactionHeader = z.infer<typeof transactionHeaderSchema>;

export const transactionSchema = z.object({
  ...transactionHeaderSchema.shape,
  detail: z.array(
    z.object({
      ...transactionDetailSchema.shape,
    })
  ),
});

export type Transaction = z.infer<typeof transactionSchema>;
