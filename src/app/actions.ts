"use server";

import { cache } from "react";
import { cookies } from "next/headers";

import { client } from "@/lib/client";

export const getUser = cache(async () => {
  const { data, error } = await client.api.auth.me.get({
    headers: {
      Cookie: cookies().toString(),
    },
  });
  if (error) {
    return null;
  }
  return data.data;
});
