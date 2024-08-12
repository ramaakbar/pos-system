"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultError, useMutation, useQuery } from "@tanstack/react-query";
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
  DrawerTrigger,
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
import { cn } from "@/lib/utils";
import { createProductDtoSchema } from "@/server/modules/products/schema";

type Props = {
  className?: string;
};

export const CreateProductDrawer = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof createProductDtoSchema>>({
    resolver: zodResolver(createProductDtoSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      price: 0,
      quantity: 0,
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.api.products)["$post"]>["form"]
  >({
    mutationFn: async (values) => {
      const res = await client.api.products.$post({
        form: values,
      });
      return await res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      form.reset();
      toast.success("Product created");
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
      const res = await client.api.categories.$get({
        query: {},
      });

      return await res.json();
    },
    enabled: false,
  });

  useEffect(() => {
    form.reset({
      categoryId: categories?.data[0].id,
    });
  }, [form, categories?.data]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size={"sm"} className={cn(className)}>
          Create Product
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Create Product</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  mutate({
                    name: values.name,
                    categoryId: values.categoryId,
                    price: String(values.price),
                    quantity: String(values.quantity),
                    media: values.media,
                  });
                })}
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
