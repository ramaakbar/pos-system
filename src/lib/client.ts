import { treaty } from "@elysiajs/eden";

import { getBaseUrl } from "@/lib/utils";
import { App } from "@/server";

export const client = treaty<App>(getBaseUrl());
