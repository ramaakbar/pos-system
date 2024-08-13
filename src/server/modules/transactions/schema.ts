import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  detailTransactionsTable,
  headerTransactionsTable,
  paymentStatusEnum,
  transactionStatusEnum,
} from "@/server/db/schema/transactions";

const insertTransactionHeaderSchema = createInsertSchema(
  headerTransactionsTable
).omit({
  amount: true,
});

const insertTransactionDetailSchema = createInsertSchema(
  detailTransactionsTable
).omit({
  transactionId: true,
});

export const createTransactionDtoSchema = z.object({
  ...insertTransactionHeaderSchema.shape,
  customer: z.string().optional(),
  address: z.string().optional(),
  detail: z.array(insertTransactionDetailSchema),
});

export const createTransactionHeaderDtoSchema = createTransactionDtoSchema.omit(
  {
    detail: true,
  }
);

export const updateTransactionStatusDtoSchema = z.object({
  transactionStatus: z.enum(transactionStatusEnum),
  paymentStatus: z.enum(paymentStatusEnum),
});
