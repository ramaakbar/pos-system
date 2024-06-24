import { z } from "@hono/zod-openapi";

import { productSchema } from "@/server/db/schema/products";
import {
  errorResponses,
  successResponseWithDataSchema,
  successResponseWithPaginationSchema,
} from "@/server/lib/common-responses";
import { paginationQuerySchema } from "@/server/lib/common-schemas";
import { createRouteConfig } from "@/server/lib/route-config";
import { isAuthenticated, isPublic } from "@/server/middlewares/guard";

import { createProductDtoSchema, updateProductDtoSchema } from "./schema";

class ProductsRoutesConfig {
  public getProducts = createRouteConfig({
    method: "get",
    path: "/",
    guard: isPublic,
    tags: ["products"],
    summary: "Get list of products",
    description: "Get list of products",
    security: [],
    request: {
      query: paginationQuerySchema,
    },
    responses: {
      200: {
        description: "Products",
        content: {
          "application/json": {
            schema: successResponseWithPaginationSchema(productSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  public getProduct = createRouteConfig({
    method: "get",
    path: "/{id}",
    guard: isPublic,
    tags: ["products"],
    summary: "Get product by id",
    description: "Get product by id",
    security: [],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Product",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(productSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  public createProduct = createRouteConfig({
    method: "post",
    path: "/",
    guard: isAuthenticated,
    tags: ["products"],
    summary: "Create new product",
    description: "Create new product",
    security: [],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: createProductDtoSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Product",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(productSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  public updateProduct = createRouteConfig({
    method: "patch",
    path: "/{id}",
    guard: isAuthenticated,
    tags: ["products"],
    summary: "Update a product",
    description: "Update a product by id",
    security: [],
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          "multipart/form-data": {
            schema: updateProductDtoSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Product",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(productSchema),
          },
        },
      },
      ...errorResponses,
    },
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ProductsRoutesConfig();
