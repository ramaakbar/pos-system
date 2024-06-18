import { apiReference } from "@scalar/hono-api-reference";

import { getBaseUrl } from "@/lib/utils";

import { CustomHono } from "../types";

const docs = (app: CustomHono) => {
  const registry = app.openAPIRegistry;

  registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "auth_session",
    description: "Cookie Authentication",
  });

  app.doc31("/api/openapi.json", {
    servers: [{ url: getBaseUrl() + "/api" }],
    info: {
      title: "Erp API",
      version: "v1",
      description: `
      This is a description about the api
      `,
    },
    openapi: "3.1.0",
    security: [{ cookieAuth: [] }],
  });

  app.get(
    "/api/docs",
    apiReference({
      spec: {
        url: "/api/openapi.json",
      },
    })
  );
};

export default docs;
