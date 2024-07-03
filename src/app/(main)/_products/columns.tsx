"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Product } from "@/server/db/schema/products";

import { useCartStore } from "../_cart/useCartStore";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const addItem = useCartStore((state) => state.addItem);

      const handleAddItem = (data: Product) => {
        addItem({
          product: data,
          quantity: 1,
        });
      };

      return <Button onClick={() => handleAddItem(row.original)}>Add</Button>;
    },
  },
];
