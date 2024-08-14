"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import useStore from "@/hooks/useStore";
import { numberToRupiah } from "@/lib/utils";

import { CartItem } from "./cart-item";
import { CheckoutDrawer } from "./checkout-drawer";
import { useCartStore } from "./useCartStore";

export const CartDrawer = () => {
  const items = useStore(useCartStore, (state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalPrice = items ? numberToRupiah(getTotalPrice()) : 0;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="w-full">
          {items && items.length > 0 ? (
            <>{`${items.length} item - ${totalPrice}`}</>
          ) : (
            "Checkout"
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] px-4 pt-4">
          <DrawerHeader>
            <DrawerTitle>Cart</DrawerTitle>
          </DrawerHeader>
          <div className="relative p-4 pb-0">
            <div className="flex h-full max-h-[300px] flex-col gap-6 overflow-auto">
              {items ? (
                items.map((item) => <CartItem key={item.id} item={item} />)
              ) : (
                <Text>Loading...</Text>
              )}
            </div>
          </div>
          <div className="flex-0 sticky inset-x-0 bottom-0 border-t bg-background p-4">
            <Text className="">Total Item: {items?.length}</Text>
            <Text className="">Total Price: {totalPrice}</Text>
            <CheckoutDrawer items={items} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
