"use client";

import { useState } from "react";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { DefaultError, useMutation } from "@tanstack/react-query";
import { t, UnwrapSchema } from "elysia";
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
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/client";
import { queryClient } from "@/lib/react-query";
import { createTransactionDtoSchema } from "@/server/modules/transactions/schema";

import { Item, useCartStore } from "./useCartStore";

type Props = {
  items: Item[] | undefined;
};

export default function CheckoutDrawer({ items }: Props) {
  const [open, setOpen] = useState(false);

  const removeAllItem = useCartStore((state) => state.removeAllItem);

  const formTransactionSchema = t.Object({
    customer: t.String(),
    address: t.String(),
    date: t.String(),
  });

  const form = useForm<UnwrapSchema<typeof formTransactionSchema>>({
    resolver: typeboxResolver(formTransactionSchema),
    defaultValues: {
      customer: "",
      address: "",
      date: new Date().toISOString().substring(0, 16),
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    UnwrapSchema<typeof createTransactionDtoSchema>
  >({
    mutationKey: ["transaction"],
    mutationFn: async (values) => {
      const { data, error } = await client.api.transactions.index.post(values);
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: async () => {
      removeAllItem();
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      form.reset();
      toast.success("Transaction Completed");
      setOpen(false);
    },
  });

  const handleCheckout = (
    formData: UnwrapSchema<typeof formTransactionSchema>
  ) => {
    if (!items || items.length < 1) {
      toast.error("cart is empty");
      return;
    }

    mutate({
      customer: formData.customer,
      address: formData.address,
      transactionStatus: "In Progress",
      paymentStatus: "Not Paid",
      paymentMethod: "transfer",
      date: formData.date,
      detail: items.map((val) => ({
        productId: val.product.id,
        price: val.product.price,
        quantity: val.quantity,
      })),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" className="w-full">
          Checkout
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>Checkout</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCheckout)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 leading-none">
                        <div className="space-y-1">
                          <FormLabel>Address</FormLabel>
                        </div>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 leading-none">
                        <div className="space-y-1">
                          <FormLabel>Date</FormLabel>
                        </div>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
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
                    <>Checkout</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
