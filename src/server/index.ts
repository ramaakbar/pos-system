import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";

import { getBaseUrl } from "@/lib/utils";

import { User } from "./db/schema/users";
import { handleError } from "./lib/utils";
import { authRoutes } from "./modules/auth";
import { categoriesRoutes } from "./modules/categories";
import { productRoutes } from "./modules/products";
import { transactionRoutes } from "./modules/transactions";

export type Env = {
  Variables: {
    user: User;
  };
};

const app = new Hono<Env>();

app.onError(handleError);

app.use(logger());
app.use(
  cors({
    origin: getBaseUrl(),
    credentials: true,
  })
);
app.use(
  csrf({
    origin: ["pos.ramaakbar.xyz"],
  })
);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-6",
  keyGenerator: (ctx) => ctx.req.header("x-forwaded-for") ?? "",
});

app.use(limiter);

const route = app
  .get("/api/ping", (c) => c.json({ message: "ping" }))
  .route("/api/auth", authRoutes)
  .route("/api/products", productRoutes)
  .route("/api/categories", categoriesRoutes)
  .route("/api/transactions", transactionRoutes);

export { app };
export type AppType = typeof route;
