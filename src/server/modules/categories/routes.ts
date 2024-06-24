import { z } from "zod";

import { categorySchema } from "@/server/db/schema/categories";
import {
  errorResponses,
  successResponseWithDataSchema,
} from "@/server/lib/common-responses";
import { createRouteConfig } from "@/server/lib/route-config";
import { isPublic } from "@/server/middlewares/guard";

class CategoriesRoutesConfig {
  public getCategories = createRouteConfig({
    method: "get",
    path: "/",
    guard: isPublic,
    tags: ["categories"],
    summary: "Get list of categories",
    description: "Get list of categories",
    security: [],
    request: {},
    responses: {
      200: {
        description: "Categories",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(z.array(categorySchema)),
          },
        },
      },
      ...errorResponses,
    },
  });

  public getCategory = createRouteConfig({
    method: "get",
    path: "/{id}",
    guard: isPublic,
    tags: ["categories"],
    summary: "Get category by id",
    description: "Get category by id",
    security: [],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Category",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(categorySchema),
          },
        },
      },
      ...errorResponses,
    },
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new CategoriesRoutesConfig();
