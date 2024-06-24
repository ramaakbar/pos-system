import type { Hook } from "@hono/zod-openapi";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

import { Env } from "../types";

const defaultHook: Hook<unknown, Env, "", unknown> = (result, c) => {
  if (!result.success && result.error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          status: 400,
          message: fromError(result.error, {
            includePath: false,
            prefix: null,
          }).toString(),
        },
      },
      400
    );
  }
};

export default defaultHook;
