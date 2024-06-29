import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";

import { getBaseUrl } from "@/lib/utils";

import { errorResponses } from "./lib/common-responses";
import { docs } from "./lib/docs";
import { authRoutes } from "./modules/auth";
import { categoriesRoute } from "./modules/categories";
import { productsRoutes } from "./modules/products";

const app = new Elysia({
  prefix: "/api",
})
  .use(docs())
  .use(
    cors({
      origin: getBaseUrl(),
      credentials: true,
    })
  )
  .use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;

      return {
        status: false,
        message: "Route not found",
      };
    } else if (code === "VALIDATION") {
      set.status = 400;
      return {
        status: false,
        message: error.all
          .map((err) => (err.schema.error ? err.schema.error : err.message))
          .join("; "),
      };
    } else if (code === "INTERNAL_SERVER_ERROR") {
      set.status = 500;

      return {
        status: false,
        message: "Internal server error",
      };
    } else {
      return {
        status: false,
        message: error.message,
      };
    }
  })
  .get("/ping", () => {
    return {
      message: "pong",
    };
  })
  .guard(
    {
      response: {
        ...errorResponses,
      },
    },
    (app) => app.use(authRoutes).use(categoriesRoute).use(productsRoutes)
  );

export { app };
export type App = typeof app;
