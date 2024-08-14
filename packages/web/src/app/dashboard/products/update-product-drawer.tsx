"use client";

import type { Product } from "api/src/db/schema/products";
import { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultError, useMutation, useQuery } from "@tanstack/react-query";
import { updateProductDtoSchema } from "api/src/modules/products/schema";
import { InferRequestType } from "hono/client";
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
import { DropzoneInput } from "@/components/ui/dropzone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { client } from "@/lib/client";
import { queryClient } from "@/lib/react-query";
import { handleResponse } from "@/lib/utils";

type Props = {
  product: Product;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export const UpdateProductDrawer = ({
  product,
  isOpen,
  setIsOpen,
  className,
}: Props) => {
  const form = useForm<z.infer<typeof updateProductDtoSchema>>({
    resolver: zodResolver(updateProductDtoSchema),
    defaultValues: {
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      quantity: product.quantity,
      // media: product.media,
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.products)[":id"]["$patch"]>["form"]
  >({
    mutationFn: async (values) => {
      const res = await client.products[":id"].$patch({
        param: {
          id: "adasd",
        },
        form: values,
      });

      await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      form.reset();
      toast.success("Product updated");
      setIsOpen(false);
    },
  });

  const {
    data: categories,
    isPending: categoryLoading,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await client.categories.$get({
        query: {},
      });

      return await handleResponse(res);
    },
    enabled: false,
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Update Product</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  mutate({
                    name: values.name,
                    categoryId: values.categoryId,
                    price: String(values.price),
                    quantity: String(values.quantity),
                    ...(values.media && { media: values.media }),
                  })
                )}
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
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <NativeSelect
                          className="w-full"
                          onClick={() => refetch()}
                          data={categories?.data!}
                          loading={categoryLoading}
                          value={field.value}
                          defaultValue={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 leading-none">
                        <div className="space-y-1">
                          <FormLabel>Price</FormLabel>
                        </div>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 leading-none">
                        <div className="space-y-1">
                          <FormLabel>Quantity</FormLabel>
                        </div>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 leading-none">
                        <div className="space-y-1">
                          <FormLabel>Picture</FormLabel>
                        </div>
                        <FormControl>
                          <DropzoneInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
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
