import { is, SelectedFields, SQL, sql } from "drizzle-orm";
import { PgTimestampString } from "drizzle-orm/pg-core";
import { SelectResultFields } from "drizzle-orm/query-builders/select.types";

export function generateCode(prefix: string) {
  const uniquePart = crypto.randomUUID().split("-")[0].toUpperCase();
  return `${prefix}-${uniquePart}`;
}

export function jsonBuildObject<T extends SelectedFields<any, any>>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }

    chunks.push(sql.raw(`'${key}',`));

    // json_build_object formats to ISO 8601 ...
    if (is(value, PgTimestampString)) {
      chunks.push(sql`timezone('UTC', ${value})`);
    } else {
      chunks.push(sql`${value}`);
    }
  });

  return sql<SelectResultFields<T>>`coalesce(json_build_object(${sql.join(
    chunks
  )}), '{}')`;
}
