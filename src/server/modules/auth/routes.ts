import { z } from "@hono/zod-openapi";

import { userSchema } from "@/server/db/schema/users";
import {
  errorResponses,
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
} from "@/server/lib/common-responses";
import { createRouteConfig } from "@/server/lib/route-config";
import { isAuthenticated, isPublic } from "@/server/middlewares/guard";

import { loginDtoSchema, registerDtoSchema } from "./schema";

class AuthRoutesConfig {
  public login = createRouteConfig({
    method: "post",
    path: "/login",
    guard: isPublic,
    tags: ["auth"],
    summary: "Login with password",
    description: "Login with email and password.",
    security: [],
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginDtoSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "User loggedin",
        headers: z.object({
          "Set-Cookie": z.string(),
        }),
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(userSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  public register = createRouteConfig({
    method: "post",
    path: "/register",
    guard: isPublic,
    tags: ["auth"],
    summary: "Register a user",
    description: "Register a user",
    security: [],
    request: {
      body: {
        content: {
          "application/json": {
            schema: registerDtoSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "User registered",
        headers: z.object({
          "Set-Cookie": z.string(),
        }),
        content: {
          "application/json": {
            schema: successResponseWithoutDataSchema,
          },
        },
      },
      ...errorResponses,
    },
  });

  public logout = createRouteConfig({
    method: "post",
    path: "/logout",
    guard: isPublic,
    tags: ["auth"],
    summary: "Logout",
    description: "Logout and clear session.",
    responses: {
      200: {
        description: "User logout",
        content: {
          "application/json": {
            schema: successResponseWithoutDataSchema,
          },
        },
      },
      ...errorResponses,
    },
  });

  public me = createRouteConfig({
    method: "get",
    path: "/me",
    guard: isAuthenticated,
    tags: ["auth"],
    summary: "Get self data",
    description: "Get the current user data.",
    responses: {
      200: {
        description: "User",
        content: {
          "application/json": {
            schema: successResponseWithDataSchema(userSchema),
          },
        },
      },
      ...errorResponses,
    },
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthRoutesConfig();
