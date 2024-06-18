import { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import { auth } from "@/server/db/lucia";
import { errorResponse } from "@/server/lib/errors";

export const isAdmin: MiddlewareHandler = async (ctx: Context, next) => {
  const user = ctx.get("user");

  if (!user || !user.role.includes("Admin")) {
    return errorResponse(ctx, 403, "forbidden");
  }

  await next();
};

export const isPublic: MiddlewareHandler = async (_, next) => {
  await next();
};

export const isAuthenticated: MiddlewareHandler = async (ctx, next) => {
  const sessionId = getCookie(ctx, auth.sessionCookieName);

  if (!sessionId) {
    const sessionCookie = auth.createBlankSessionCookie();
    setCookie(ctx, auth.sessionCookieName, sessionCookie.serialize(), {
      ...sessionCookie.attributes,
      sameSite: "Strict",
    });
    return errorResponse(ctx, 401, "Not authorized");
  }

  const { session, user } = await auth.validateSession(sessionId);

  if (!session) {
    const sessionCookie = auth.createBlankSessionCookie();
    setCookie(ctx, auth.sessionCookieName, sessionCookie.serialize(), {
      ...sessionCookie.attributes,
      sameSite: "Strict",
    });
    return errorResponse(ctx, 401, "Not authorized");
  }

  if (session && session.fresh) {
    const sessionCookie = auth.createSessionCookie(session.id);
    setCookie(ctx, auth.sessionCookieName, sessionCookie.serialize(), {
      ...sessionCookie.attributes,
      sameSite: "Strict",
    });
  }

  ctx.set("user", user);
  ctx.set("session", session);

  await next();
};
