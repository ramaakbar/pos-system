import { zValidator } from "@hono/zod-validator";
import { is, SelectedFields, SQL, sql } from "drizzle-orm";
import { PgTimestampString } from "drizzle-orm/pg-core";
import { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { Context, ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { z, ZodError, ZodIssue, ZodSchema } from "zod";
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

export const ErrorCodeEnum = z.enum([
  "BAD_REQUEST",
  "FORBIDDEN",
  "INTERNAL_SERVER_ERROR",
  "USAGE_EXCEEDED",
  "DISABLED",
  "CONFLICT",
  "NOT_FOUND",
  "NOT_UNIQUE",
  "UNAUTHORIZED",
  "METHOD_NOT_ALLOWED",
  "UNPROCESSABLE_ENTITY",
]);

export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

export function statusToCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 405:
      return "METHOD_NOT_ALLOWED";
    case 409:
      return "METHOD_NOT_ALLOWED";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

export function codeToStatus(code: ErrorCode): number {
  switch (code) {
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "METHOD_NOT_ALLOWED":
      return 405;
    case "CONFLICT":
      return 409;
    case "UNPROCESSABLE_ENTITY":
      return 422;
    case "INTERNAL_SERVER_ERROR":
      return 500;
    default:
      return 500;
  }
}

// cal.com: https://github.com/calcom/cal.com/blob/5d325495a9c30c5a9d89fc2adfa620b8fde9346e/packages/lib/server/getServerErrorFromUnknown.ts#L17
export function parseZodErrorIssues(issues: ZodIssue[]): string {
  return issues
    .map((i) =>
      i.code === "invalid_union"
        ? i.unionErrors.map((ue) => parseZodErrorIssues(ue.issues)).join("; ")
        : i.code === "unrecognized_keys"
          ? i.message
          : `${i.path.length ? `${i.code} in '${i.path}': ` : ""}${i.message}`
    )
    .join("; ");
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
      const error = fromError(result.error, {
        prefix: null,
        includePath: false,
      }).toString();
      return c.json({
        success: false,
        message: error,
      });
    }
  });
