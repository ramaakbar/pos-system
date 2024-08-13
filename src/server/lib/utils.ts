import { zValidator } from "@hono/zod-validator";
import { is, SelectedFields, SQL, sql } from "drizzle-orm";
import { PgTimestampString } from "drizzle-orm/pg-core";
import { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { Context, ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError, ZodSchema } from "zod";
import { fromError } from "zod-validation-error";

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

export function handleError(err: Error, c: Context): Response {
  if (err instanceof ZodError) {
    const error = fromError(err.issues, {
      prefix: null,
      includePath: false,
    });
    return c.json(
      {
        success: false,
        message: error,
      },
      { status: 400 }
    );
  }
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      { status: err.status }
    );
  }
  return c.json(
    {
      success: false,
      message: err.message ?? "Something went wrong",
    },

    { status: 500 }
  );
}

export const validator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      const error = fromError(result.error, {
        prefix: null,
        includePath: false,
      }).toString();
      return c.json(
        {
          success: false,
          message: error,
        },
        400
      );
    }
  });
