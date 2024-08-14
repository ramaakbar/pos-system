import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { Env } from "..";
import {
  accessTokenName,
  checkTokens,
  refreshTokenName,
} from "../modules/auth/utils/authTokens";

export const authGuard = createMiddleware<Env>(async (ctx, next) => {
  const accessToken = getCookie(ctx, accessTokenName);
  const refreshToken = getCookie(ctx, refreshTokenName);

  if (!accessToken && !refreshToken) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const user = await checkTokens(ctx, accessToken!, refreshToken);

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  ctx.set("user", user);

  await next();
});

export const adminGuard = createMiddleware<Env>(async (ctx, next) => {
  const user = ctx.get("user");

  if (user.role !== "Admin") {
    throw new HTTPException(403, { message: "Not allowed" });
  }

  await next();
});
