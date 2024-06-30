import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { generateIdFromEntropySize } from "lucia";

import { db } from "@/server/db";
import { userSchema, usersTable } from "@/server/db/schema/users";
import {
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
} from "@/server/lib/common-responses";
import { ctx } from "@/server/plugins/context";

import { loginDtoSchema, registerDtoSchema } from "./schema";

export const authRoutes = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
  },
})
  .use(ctx)
  .post(
    "/login",
    async ({ body, cookie, set, auth }) => {
      const { email, password } = body;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()));

      if (!user) {
        set.status = "Bad Request";
        throw new Error("Email not found");
      }

      const validPassword = await Bun.password.verify(password, user.password);
      if (!validPassword) {
        set.status = "Bad Request";
        throw new Error("Invalid Credentials");
      }

      const session = await auth.createSession(user.id, {});
      const sessionCookie = auth.createSessionCookie(session.id);

      cookie[sessionCookie.name].value = sessionCookie.value;
      cookie[sessionCookie.name].set({
        ...sessionCookie.attributes,
        sameSite: "strict",
      });

      const { password: pass, ...userWithoutPass } = user;

      return {
        success: true,
        data: userWithoutPass,
      };
    },
    {
      body: loginDtoSchema,
      response: {
        200: successResponseWithDataSchema(userSchema),
      },
    }
  )
  .post(
    "/register",
    async ({ body, cookie, set, auth }) => {
      const { email, password } = body;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()));

      if (user) {
        set.status = "Bad Request";
        throw new Error("Email already used");
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

      cookie[sessionCookie.name].value = sessionCookie.value;
      cookie[sessionCookie.name].set({
        ...sessionCookie.attributes,
        sameSite: "strict",
      });

      return {
        success: true,
      };
    },
    {
      body: registerDtoSchema,
      response: {
        200: successResponseWithoutDataSchema,
      },
    }
  )
  .post(
    "/logout",
    async ({ cookie, set, auth }) => {
      const sessionId = cookie[auth.sessionCookieName].value;

      if (!sessionId) {
        set.status = "Unauthorized";
        throw new Error("Unauthorized");
      }

      await auth.invalidateSession(sessionId);

      cookie[auth.sessionCookieName].value = "";
      cookie[auth.sessionCookieName].set({
        expires: new Date(0),
        sameSite: "strict",
      });

      return {
        success: true,
      };
    },
    {
      response: {
        200: successResponseWithoutDataSchema,
      },
    }
  )
  .guard({
    isAuth: true,
  })
  .get("/me", ({ user }) => {
    return { data: user };
  });
