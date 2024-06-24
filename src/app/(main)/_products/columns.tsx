"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Product } from "@/server/db/schema/products";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
];
