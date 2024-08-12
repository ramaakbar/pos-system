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
import { formatDate } from "@/lib/utils";
import { Category } from "@/server/db/schema/categories";

import { DeleteCategoryDrawer } from "./delete-category-drawer";
import { UpdateCategoryDrawer } from "./update-category-drawer";

export const getCategoryColumns = (): ColumnDef<Category>[] => {
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
        const [isDeleteCategoryDrawerOpen, setIsDeleteCategoryDrawerOpen] =
          useState(false);

        const [isUpdateCategoryDrawerOpen, setIsUpdateCategoryDrawerOpen] =
          useState(false);

        return (
          <>
            <DeleteCategoryDrawer
              category={row.original}
              isOpen={isDeleteCategoryDrawerOpen}
              setIsOpen={setIsDeleteCategoryDrawerOpen}
            />
            <UpdateCategoryDrawer
              category={row.original}
              isOpen={isUpdateCategoryDrawerOpen}
              setIsOpen={setIsUpdateCategoryDrawerOpen}
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
                      onClick={() => setIsUpdateCategoryDrawerOpen(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={"destructive"}
                      className="w-full"
                      onClick={() => setIsDeleteCategoryDrawerOpen(true)}
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
