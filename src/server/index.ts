import docs from "./lib/docs";
import { errorResponse } from "./lib/errors";
import middlewares from "./middlewares";
import { authRoutes } from "./modules/auth";
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
  return errorResponse(ctx, 500, "Internal server Error");
});

const routes = app.route("/api/auth", authRoutes);

export type AppType = typeof routes;

export { app };
