import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatDate, numberToRupiah } from "@/lib/utils";
import { Product } from "@/server/db/schema/products";

import { DeleteProductDrawer } from "./delete-product-drawer";
import { UpdateProductDrawer } from "./update-product-drawer";

export const getProductColumns = (): ColumnDef<Product>[] => {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "media",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => (
        <img src={row.getValue("media")} className="aspect-square size-16" />
      ),
    },
    {
      accessorKey: "category.name",
      id: "categoryId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ cell }) => numberToRupiah(cell.getValue() as number),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isDeleteProductDrawerOpen, setIsDeleteProductDrawerOpen] =
          useState(false);

        const [isUpdateProductDrawerOpen, setIsUpdateProductDrawerOpen] =
          useState(false);

        return (
          <>
            <DeleteProductDrawer
              product={row.original}
              isOpen={isDeleteProductDrawerOpen}
              setIsOpen={setIsDeleteProductDrawerOpen}
            />
            <UpdateProductDrawer
              product={row.original}
              isOpen={isUpdateProductDrawerOpen}
              setIsOpen={setIsUpdateProductDrawerOpen}
            />
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
                  <DrawerHeader>
                    <DrawerTitle>Actions</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col gap-4 p-4 pb-0">
                    <Button
                      variant={"secondary"}
                      className="w-full"
                      onClick={() => setIsUpdateProductDrawerOpen(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={"destructive"}
                      className="w-full"
                      onClick={() => setIsDeleteProductDrawerOpen(true)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </>
        );
      },
    },
  ];
};
