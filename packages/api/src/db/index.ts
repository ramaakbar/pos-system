import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../env";
import { categoriesTable } from "./schema/categories";
import { customersTable } from "./schema/customers";
import { productsTable } from "./schema/products";
import {
  detailTransactionsTable,
  headerTransactionsTable,
} from "./schema/transactions";
import { usersTable } from "./schema/users";

const connection = postgres(env.DB_URL, {
  prepare: true,
});

export const db = drizzle(connection, {
  schema: {
    usersTable,
    customersTable,
    categoriesTable,
    productsTable,
    headerTransactionsTable,
    detailTransactionsTable,
  },
});

export type DB =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];
