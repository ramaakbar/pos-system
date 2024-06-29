import Elysia from "elysia";

import { auth } from "../db/lucia";

export const ctx = new Elysia()
  .decorate("auth", auth)
  .derive({ as: "global" }, async ({ cookie, request, auth }) => {
    // CSRF check
    // if (request.method !== "GET") {
    //   const originHeader = request.headers.get("Origin");
    //   const hostHeader = request.headers.get("Host");
    //   console.log({
    //     originHeader,
    //     hostHeader,
    //   });
    //   if (
    //     !originHeader ||
    //     !hostHeader ||
    //     !verifyRequestOrigin(originHeader, [hostHeader])
    //   ) {
    //     return {
    //       user: null,
    //     };
    //   }
    // }

    const sessionId = cookie[auth.sessionCookieName].value;
    if (!sessionId) {
      return {
        user: null,
      };
    }

    const { session, user } = await auth.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = auth.createSessionCookie(session.id);
      cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });
    }
    if (!session) {
      const sessionCookie = auth.createBlankSessionCookie();
      cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });

      return {
        user: null,
      };
    }
    return {
      user: user,
    };
  })
  .macro(({ onBeforeHandle }) => ({
    isAuth(value: boolean) {
      onBeforeHandle(({ user, set, cookie }) => {
        if (value && !user) {
          set.status = "Unauthorized";
          throw new Error("Unauthorized");
        }
      });
    },
    isAdmin(value: boolean) {
      onBeforeHandle(({ user, set }) => {
        if (value && user?.role !== "Admin") {
          set.status = "Forbidden";
          throw new Error("Forbidden");
        }
      });
    },
  }));
