import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { clientEnvs } from "../env/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (clientEnvs.NEXT_PUBLIC_DOMAIN.startsWith("localhost"))
    return `http://${clientEnvs.NEXT_PUBLIC_DOMAIN}`;
  return `https://${clientEnvs.NEXT_PUBLIC_DOMAIN}`;
}
