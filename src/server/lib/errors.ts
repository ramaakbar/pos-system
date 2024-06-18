import type { Context } from "hono";
import type {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
} from "hono/utils/http-status";
import type { z } from "zod";

import { errorSchema } from "./common-schemas";

export type HttpErrorStatus = ClientErrorStatusCode | ServerErrorStatusCode;

export type ErrorType = z.infer<typeof errorSchema>;

export const errorResponse = (
  ctx: Context,
  status: HttpErrorStatus,
  message: string
) => {
  const error: ErrorType = {
    status,
    message,
  };

  return ctx.json({ success: false, error }, status as 400);
};
