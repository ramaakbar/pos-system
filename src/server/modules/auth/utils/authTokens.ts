import { eq } from "drizzle-orm";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign, verify } from "jsonwebtoken";

import { clientEnvs } from "@/env/client";
import { serverEnvs } from "@/env/server";
import { Env } from "@/server";
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
    expiresIn: "15min",
  });

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: "/",
  httpOnly: true,
  secure: serverEnvs.NODE_ENV === "production",
  domain:
    serverEnvs.NODE_ENV === "production" ? clientEnvs.NEXT_PUBLIC_DOMAIN : "",
  maxAge: 34560000, // 1 year
} as const;

export const accessTokenName = "accessToken";
export const refreshTokenName = "refreshToken";

export const sendAuthCookies = (ctx: Context<Env>, user: User) => {
  const { accessToken, refreshToken } = createAuthTokens(user);

  setCookie(ctx, accessTokenName, accessToken, cookieOpts);
  setCookie(ctx, refreshTokenName, refreshToken, cookieOpts);
};

export const clearAuthCookies = (ctx: Context<Env>) => {
  deleteCookie(ctx, accessTokenName, cookieOpts);
  deleteCookie(ctx, refreshTokenName, cookieOpts);
};

export const checkTokens = async (
  ctx: Context<Env>,
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

  sendAuthCookies(ctx, user);

  return user;
};
