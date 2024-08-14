import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { Env } from "../..";
import { db } from "../../db";
import { User, usersTable } from "../../db/schema/users";
import { validator } from "../../lib/utils";
import { loginDtoSchema, registerDtoSchema } from "./schema";
import {
  accessTokenName,
  checkTokens,
  clearAuthCookies,
  refreshTokenName,
  sendAuthCookies,
} from "./utils/authTokens";

export const authRoutes = new Hono<Env>()
  .post("/login", validator("json", loginDtoSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email.toLowerCase()));

    if (!user) {
      throw new HTTPException(400, { message: "Email not found" });
    }

    const validPassword = await Bun.password.verify(
      body.password,
      user.password
    );
    if (!validPassword) {
      throw new HTTPException(400, { message: "Invalid Credentials" });
    }

    const { password, ...userWithoutPass } = user;
    sendAuthCookies(ctx, userWithoutPass);

    return ctx.json(
      {
        success: true,
        data: userWithoutPass,
      },
      200
    );
  })
  .post("/register", validator("json", registerDtoSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const [foundUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email.toLowerCase()));

    if (foundUser) {
      throw new HTTPException(400, { message: "Email already used" });
    }
    const passwordHash = await Bun.password.hash(body.password);

    const [{ password: omitPassword, ...user }] = await db
      .insert(usersTable)
      .values({
        email: body.email,
        password: passwordHash,
        role: "Member",
      })
      .returning();

    sendAuthCookies(ctx, user);

    return ctx.json(
      {
        success: true,
        data: user,
      },
      200
    );
  })
  .post("/logout", (ctx) => {
    clearAuthCookies(ctx);

    return ctx.json({}, 200);
  })
  .get("/me", async (ctx) => {
    const accessToken = getCookie(ctx, accessTokenName);
    const refreshToken = getCookie(ctx, refreshTokenName);

    let user: User | null | undefined = null;

    user = await checkTokens(ctx, accessToken!, refreshToken);

    return ctx.json({ success: true, user }, 200);
  });
