import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";

import { User } from "./db/schema/users";
import { env } from "./env";
import { getClientBaseUrl, handleError } from "./lib/utils";
import { authRoutes } from "./modules/auth";
import { categoriesRoutes } from "./modules/categories";
import { productRoutes } from "./modules/products";
import { transactionRoutes } from "./modules/transactions";

export type Env = {
  Variables: {
    user: User;
  };
};

const app = new Hono<Env>({
  strict: false
});
app.onError(handleError);

app.use(logger());
app.use(
  cors({
    origin: getClientBaseUrl(),
    credentials: true,
  })
);
app.use(
  csrf({
    origin: [getClientBaseUrl()],
  })
);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-6",
  keyGenerator: (ctx) => ctx.req.header("x-forwaded-for") ?? "",
});

app.use(limiter);

app.use(
  "/static/*",
  serveStatic({
    root: "./src/",
  })
);

app.notFound((ctx) => {
  return ctx.json(
    {
      success: false,
      message: "Route not found",
    },
    404
  );
});

const routes = app
  .get("/", (c) => c.json({ message: "Pos System REST API" }))
  .get("/ping", (c) => c.json({ message: "ping" }))
  .route("/auth", authRoutes)
  .route("/products", productRoutes)
  .route("/categories", categoriesRoutes)
  .route("/transactions", transactionRoutes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};

export type AppType = typeof routes;
