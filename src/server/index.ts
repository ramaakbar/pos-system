import docs from "./lib/docs";
import { errorResponse } from "./lib/errors";
import middlewares from "./middlewares";
import { authRoutes } from "./modules/auth";
import { categoriesRoute } from "./modules/categories";
import { productsRoute } from "./modules/products";
import { CustomHono } from "./types";

const app = new CustomHono();

// Add global middleware
app.route("", middlewares);

docs(app);

app.get("/api/ping", (ctx) => ctx.json({ message: "pong" }));

app.notFound((ctx) => {
  return errorResponse(ctx, 404, "Route not found");
});

app.onError((err, ctx) => {
  console.log(err);
  return errorResponse(ctx, 500, "Internal server Error");
});

const routes = app
  .route("/api/auth", authRoutes)
  .route("/api/categories", categoriesRoute)
  .route("/api/products", productsRoute);

export type AppType = typeof routes;

export { app };
