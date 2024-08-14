import { eq } from "drizzle-orm";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign, verify } from "jsonwebtoken";

import { Env } from "../../..";
import { db } from "../../../db";
import { User, usersTable } from "../../../db/schema/users";
import { env } from "../../../env";

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
    env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
  const accessToken = sign({ user: user }, env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15min",
  });

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  domain: env.NODE_ENV === "production" ? env.DOMAIN : "",
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
      verify(accessToken, env.ACCESS_TOKEN_SECRET as string)
    );

    return data.user;
  } catch {}

  if (!refreshToken) {
    return null;
  }

  let data;
  try {
    data = <RefreshTokenData>(
      verify(refreshToken, env.REFRESH_TOKEN_SECRET as string)
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
