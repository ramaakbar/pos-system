import type { ClassValue } from "clsx";
import { TLiteral, TUnion, Type } from "@sinclair/typebox";
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
