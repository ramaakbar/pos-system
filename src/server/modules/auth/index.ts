import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { db } from "@/server/db";
import { userSchema, usersTable } from "@/server/db/schema/users";
import {
  successResponseWithDataSchema,
  successResponseWithoutDataSchema,
} from "@/server/lib/common-responses";
import { ctx } from "@/server/plugins/context";

import { loginDtoSchema, registerDtoSchema } from "./schema";
import { clearAuthCookies, sendAuthCookies } from "./service";

export const authRoutes = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
  },
})
  .use(ctx)
  .post(
    "/login",
    async ({ body, cookie, set }) => {
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

      const { password: pass, ...userWithoutPass } = user;

      sendAuthCookies(cookie, userWithoutPass);

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
    async ({ body, cookie, set }) => {
      const { email, password } = body;

      const [foundUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()));

      if (foundUser) {
        set.status = "Bad Request";
        throw new Error("Email already used");
      }

      const passwordHash = await Bun.password.hash(password);

      const [{ password: omitPassword, ...user }] = await db
        .insert(usersTable)
        .values({
          email,
          password: passwordHash,
          role: "Member",
        })
        .returning();

      sendAuthCookies(cookie, user);

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
    async ({ cookie }) => {
      clearAuthCookies(cookie);

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
    isAuth: false,
  })
  .get("/me", ({ user }) => {
    return { user };
  });
