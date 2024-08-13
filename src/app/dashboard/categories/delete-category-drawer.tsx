import { Dispatch, SetStateAction } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { client } from "@/lib/client";
import { queryClient } from "@/lib/react-query";
import { handleResponse } from "@/lib/utils";
import { Category } from "@/server/db/schema/categories";

type Props = {
  category: Category;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const DeleteCategoryDrawer = ({
  category,
  isOpen,
  setIsOpen,
}: Props) => {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await client.api.categories[":id"].$delete({
        param: {
          id: category.id,
        },
      });

      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      toast.success("Category successfully deleted");
      setIsOpen(false);
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>
              Are you sure you want to delete {category.name}?
            </DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="gap-2 sm:space-x-0">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending && (
                <Loader2Icon
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
