import type { AppType } from "api";
import { hc } from "hono/client";

import { getBaseUrl } from "@/lib/utils";

export const client = hc<AppType>(getBaseUrl(), {
  // @ts-ignore
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});
