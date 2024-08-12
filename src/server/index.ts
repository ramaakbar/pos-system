import { Hono } from "hono";
import { logger } from "hono/logger";

import { User } from "./db/schema/users";
import { handleError } from "./lib/utils";
import { authRoutes } from "./modules/auth";
import { categoriesRoutes } from "./modules/categories";
import { productRoutes } from "./modules/products";

export type Env = {
  Variables: {
    user: User;
  };
};

const app = new Hono<Env>();

app.onError(handleError);

app.use(logger());

const route = app
  .get("/api/ping", (c) => c.json({ message: "ping" }))
  .route("/api/auth", authRoutes)
  .route("/api/products", productRoutes)
  .route("/api/categories", categoriesRoutes);

export { app };
export type AppType = typeof route;
