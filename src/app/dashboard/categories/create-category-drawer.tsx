"use client";

import { useState } from "react";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { DefaultError, useMutation } from "@tanstack/react-query";
import { UnwrapSchema } from "elysia";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { cn } from "@/lib/utils";
import { createCategoryDtoSchema } from "@/server/modules/categories/schema";

type Props = {
  className?: string;
};

export const CreateCategoryDrawer = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UnwrapSchema<typeof createCategoryDtoSchema>>({
    resolver: typeboxResolver(createCategoryDtoSchema),
    defaultValues: {
      name: "",
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    UnwrapSchema<typeof createCategoryDtoSchema>
  >({
    mutationKey: ["categories"],
    mutationFn: async (values) => {
      const { data, error } = await client.api.categories.index.post(values);
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      form.reset();
      toast.success("Category created");
      setIsOpen(false);
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size={"sm"} className={cn(className)}>
          Create Category
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Create Category</DrawerTitle>
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
                    <>Create</>
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
