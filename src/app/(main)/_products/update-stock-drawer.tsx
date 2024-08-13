import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultError, useMutation, useQuery } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AutoComplete } from "@/components/ui/autocomplete";
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
import { handleResponse } from "@/lib/utils";
import { updateProductDtoSchema } from "@/server/modules/products/schema";

export const UpdateStockDrawer = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof updateProductDtoSchema>>({
    resolver: zodResolver(updateProductDtoSchema),
    defaultValues: {
      name: "",
      quantity: 0,
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.api.products)[":id"]["$patch"]>["form"]
  >({
    mutationFn: async (values) => {
      const res = await client.api.products[":id"].$patch({
        param: {
          id: values.name as string,
        },
        form: values,
      });

      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      form.reset();
      toast.success("Product's stock updated");
      setOpen(false);
    },
  });

  const [searchValue, setSearchValue] = useState<string>("");

  const { data, isFetching } = useQuery({
    queryKey: ["products", searchValue],
    queryFn: async () => {
      const res = await client.api.products.$get({
        query: {
          search: searchValue,
        },
      });

      return await handleResponse(res);
    },
    select: (data) => {
      return data.data.map(({ name, id }) => ({
        value: id,
        label: name,
      }));
    },
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size={"sm"} className="w-full">
          Update Product Stock
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Update Product Stock</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  mutate({
                    quantity: String(values.quantity),
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
                        {/* <Input {...field} /> */}
                        <AutoComplete
                          selectedValue={field.value}
                          onSelectedValueChange={field.onChange}
                          searchValue={searchValue}
                          onSearchValueChange={setSearchValue}
                          items={data ?? []}
                          isLoading={isFetching}
                          emptyMessage="Item Not found"
                        />
                      </FormControl>
                      <FormMessage />
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
