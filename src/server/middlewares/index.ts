import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";

import { getBaseUrl } from "@/lib/utils";

import { ContextVariables } from "../types";

export const app = new OpenAPIHono<{
  Variables: ContextVariables;
}>();

app.use("*", secureHeaders());

app.use(
  "*",
  cors({
    origin: getBaseUrl(),
    credentials: true,
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
    allowHeaders: [],
  })
);

app.use(
  "*",
  csrf({
    origin: getBaseUrl(),
  })
);

export default app;
