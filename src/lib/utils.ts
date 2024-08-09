import type { ClassValue } from "clsx";
import { TLiteral, TUnion, Type } from "@sinclair/typebox";
import { SortingState } from "@tanstack/react-table";
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

export const numberToRupiah = (val: number): string => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return formatter.format(val);
};

export type TLiteralUnion<
  T extends string[],
  Acc extends TLiteral[] = [],
> = T extends [infer L extends string, ...infer R extends string[]]
  ? TLiteralUnion<R, [...Acc, TLiteral<L>]>
  : TUnion<Acc>;

export function LiteralUnion<T extends string[]>(
  values: readonly [...T]
): TLiteralUnion<T> {
  return Type.Union(values.map((value) => Type.Literal(value))) as never;
}

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
