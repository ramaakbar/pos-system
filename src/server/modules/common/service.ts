import { eq } from "drizzle-orm";
import { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

import { DB, db } from "@/server/db";

export const checkRecordExistsById = async <
  T extends AnyPgTable & { id: AnyPgColumn },
>(
  table: T,
  id: string,
  _db: DB = db
): Promise<Boolean> => {
  const [record] = await _db.select().from(table).where(eq(table.id, id));
  return Boolean(record);
};

export const checkDuplicateFieldValue = async <
  T extends AnyPgTable & { id: AnyPgColumn },
>(
  table: T,
  fieldColumn: AnyPgColumn,
  value: string,
  _db: DB = db
) => {
  const [record] = await _db.select().from(table).where(eq(fieldColumn, value));
  return record;
};
