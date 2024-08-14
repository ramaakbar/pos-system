import type { ClassValue } from "clsx";
import { SortingState } from "@tanstack/react-table";
import { clsx } from "clsx";
import { ClientResponse } from "hono/client";
import { twMerge } from "tailwind-merge";

import { env } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (env.BACKEND_URL.startsWith("localhost"))
    return `http://${env.BACKEND_URL}`;
  return `https://${env.BACKEND_URL}`;
}

export const numberToRupiah = (val: number): string => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return formatter.format(val);
};

export const handleResponse = async <
  T extends Record<string, any>,
  U extends ClientResponse<T, number, "json">,
>(
  response: U
) => {
  const data = await response.json();
  if (!data.success) {
    throw Error(data.message);
  }
  return data as Awaited<ReturnType<Extract<U, { status: 200 }>["json"]>>;
};

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export const stateToSortBy = (sorting: SortingState | undefined) => {
  if (!sorting || sorting.length == 0) return "createdAt.asc";
  const sort = sorting[0];

  return `${sort.id}.${sort.desc ? "desc" : "asc"}` as const;
};

export const sortByToState = (sortBy: string | undefined) => {
  if (!sortBy) return [];

  const [id, desc] = sortBy.split(".");
  return [{ id, desc: desc === "desc" }];
};
