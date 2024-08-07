import Elysia from "elysia";

import {
  accessTokenName,
  checkTokens,
  refreshTokenName,
} from "../modules/auth/service";

export const ctx = new Elysia()
  .derive({ as: "global" }, async ({ cookie, request }) => {
    const accessToken = cookie[accessTokenName].value;
    const refreshToken = cookie[refreshTokenName].value;

    if (!accessToken && !refreshToken) {
      return {
        user: null,
      };
    }

    const user = await checkTokens(cookie, accessToken!, refreshToken);

    return {
      user: user,
    };
  })
  .macro(({ onBeforeHandle }) => ({
    isAuth(value: boolean) {
      onBeforeHandle(({ user, set }) => {
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
