"use client";

import { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultError, useMutation } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { queryClient } from "@/lib/react-query";
import { handleResponse } from "@/lib/utils";
import { Category } from "@/server/db/schema/categories";
import { createCategoryDtoSchema } from "@/server/modules/categories/schema";

type Props = {
  category: Category;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export const UpdateCategoryDrawer = ({
  category,
  isOpen,
  setIsOpen,
  className,
}: Props) => {
  const form = useForm<z.infer<typeof createCategoryDtoSchema>>({
    resolver: zodResolver(createCategoryDtoSchema),
    defaultValues: {
      name: category.name,
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.api.categories)[":id"]["$patch"]>["json"]
  >({
    mutationFn: async (values) => {
      const res = await client.api.categories[":id"].$patch({
        param: {
          id: category.id,
        },
        json: values,
      });

      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      form.reset();
      toast.success("Category updated");
      setIsOpen(false);
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Update Category</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className={"mr-2 inline size-4 animate-spin"} />
                      Loading...
                    </>
                  ) : (
                    <>Update</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
