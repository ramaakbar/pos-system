import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { generateIdFromEntropySize } from "lucia";

import { db } from "@/server/db";
import { errorResponse } from "@/server/lib/errors";

import { auth } from "../../db/lucia";
import { usersTable } from "../../db/schema/users";
import defaultHook from "../../lib/default-hook";
import { CustomHono } from "../../types";
import authRoutesConfig from "./routes";

export const authRoutes = new CustomHono({
  defaultHook,
})
  .openapi(authRoutesConfig.login, async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    if (!user) {
      return errorResponse(ctx, 404, "Email not found");
    }

    const validPassword = await Bun.password.verify(password, user.password);
    if (!validPassword) {
      return errorResponse(ctx, 400, "Invalid Password");
    }

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    setCookie(ctx, sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      sameSite: "Strict",
    });

    const { password: pass, ...userWithoutPass } = user;

    return ctx.json(
      {
        success: true,
        data: userWithoutPass,
      },
      200
    );
  })
  .openapi(authRoutesConfig.register, async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    if (user) {
      return errorResponse(ctx, 404, "Email already used");
    }

    const passwordHash = await Bun.password.hash(password);

    const userId = generateIdFromEntropySize(10);

    await db.insert(usersTable).values({
      id: userId,
      email,
      password: passwordHash,
      role: "Member",
    });

    const session = await auth.createSession(userId, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    setCookie(ctx, sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      sameSite: "Strict",
    });

    return ctx.json(
      {
        success: true,
      },
      200
    );
  })
  .openapi(authRoutesConfig.logout, async (ctx) => {
    const sessionId = getCookie(ctx, auth.sessionCookieName);

    if (!sessionId) {
      return errorResponse(ctx, 401, "unauthorized");
    }

    await auth.invalidateSession(sessionId);
    setCookie(ctx, auth.sessionCookieName, "", {
      expires: new Date(0),
      sameSite: "Strict",
    });

    return ctx.json({ success: true }, 200);
  })
  .openapi(authRoutesConfig.me, async (ctx) => {
    const user = ctx.get("user");

    return ctx.json({ success: true, data: user }, 200);
  });
