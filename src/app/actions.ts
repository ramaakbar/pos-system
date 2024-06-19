import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Routes } from "@/lib/routes";
import { auth } from "@/server/db/lucia";

export const getUser = cache(async () => {
  const sessionId = cookies().get(auth.sessionCookieName)?.value;
  if (!sessionId) return null;

  const { user } = await auth.validateSession(sessionId);
  return user;
});

export async function logout() {
  "use server";
  const sessionId = cookies().get(auth.sessionCookieName)?.value;

  if (!sessionId) {
    return redirect(Routes.login());
  }

  await auth.invalidateSession(sessionId);
  cookies().set(auth.sessionCookieName, "", {
    expires: new Date(0),
    sameSite: "strict",
  });
  return redirect(Routes.login());
}
