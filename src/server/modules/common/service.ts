import { eq } from "drizzle-orm";
import { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

import { db } from "@/server/db";

export const checkRecordExistsById = async <
  T extends AnyPgTable & { id: AnyPgColumn },
>(
  table: T,
  id: string
): Promise<Boolean> => {
  const [record] = await db.select().from(table).where(eq(table.id, id));
  return Boolean(record);
};

export const checkDuplicateFieldValue = async <
  T extends AnyPgTable & { id: AnyPgColumn },
>(
  table: T,
  fieldColumn: AnyPgColumn,
  value: string
) => {
  const [record] = await db.select().from(table).where(eq(fieldColumn, value));
  return record;
};
