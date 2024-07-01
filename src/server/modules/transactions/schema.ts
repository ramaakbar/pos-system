import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";

import {
  detailTransactionsTable,
  headerTransactionsTable,
} from "@/server/db/schema/transactions";

const insertTransactionHeaderSchema = createInsertSchema(
  headerTransactionsTable
);

const insertTransactionDetailSchema = createInsertSchema(
  detailTransactionsTable
);

export const createTransactionDtoSchema = t.Object({
  ...t.Omit(insertTransactionHeaderSchema, ["createdAt", "updatedAt"])
    .properties,
  detail: t.Array(
    t.Omit(insertTransactionDetailSchema, ["createdAt", "updatedAt"])
  ),
});
