import { eq } from "drizzle-orm";
import { Cookie } from "elysia";
import { sign, verify } from "jsonwebtoken";

import { clientEnvs } from "@/env/client";
import { serverEnvs } from "@/env/server";
import { db } from "@/server/db";
import { User, usersTable } from "@/server/db/schema/users";

export type RefreshTokenData = {
  user: User;
  refreshTokenVersion?: number;
};

export type AccessTokenData = {
  user: User;
};

const createAuthTokens = (
  user: User
): { refreshToken: string; accessToken: string } => {
  const refreshToken = sign(
    { user: user, refreshTokenVersion: user.refreshTokenVersion },
    serverEnvs.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
  const accessToken = sign({ user: user }, serverEnvs.ACCESS_TOKEN_SECRET, {
    expiresIn: "1min",
  });

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: "/",
  httpOnly: true,
  secure: serverEnvs.NODE_ENV === "production",
  domain:
    serverEnvs.NODE_ENV === "production" ? clientEnvs.NEXT_PUBLIC_DOMAIN : "",
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
};

export const accessTokenName = "accessToken";
export const refreshTokenName = "refreshToken";

export const sendAuthCookies = (
  cookie: Record<string, Cookie<string | undefined>>,
  user: User
) => {
  const { accessToken, refreshToken } = createAuthTokens(user);

  cookie[accessTokenName].value = accessToken;
  cookie[accessTokenName].set({
    ...cookieOpts,
  });

  cookie[refreshTokenName].value = refreshToken;
  cookie[refreshTokenName].set({
    ...cookieOpts,
  });
};

export const clearAuthCookies = (
  cookie: Record<string, Cookie<string | undefined>>
) => {
  cookie[accessTokenName].value = "";
  cookie[accessTokenName].set({
    expires: new Date(0),
  });

  cookie[refreshTokenName].value = "";
  cookie[refreshTokenName].set({
    expires: new Date(0),
  });
};

export const checkTokens = async (
  cookie: Record<string, Cookie<string | undefined>>,
  accessToken: string,
  refreshToken: string | undefined
) => {
  try {
    const data = <AccessTokenData>(
      verify(accessToken, serverEnvs.ACCESS_TOKEN_SECRET)
    );

    return data.user;
  } catch {}

  if (!refreshToken) {
    return null;
  }

  let data;
  try {
    data = <RefreshTokenData>(
      verify(refreshToken, serverEnvs.REFRESH_TOKEN_SECRET)
    );
  } catch {
    return null;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, data.user.id),
  });
  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    return null;
  }

  sendAuthCookies(cookie, user);

  return user;
};
