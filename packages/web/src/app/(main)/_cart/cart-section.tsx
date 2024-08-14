"use client";

import useStore from "@/hooks/useStore";
import { numberToRupiah } from "@/lib/utils";

import { CartItem } from "./cart-item";
import { CheckoutDrawer } from "./checkout-drawer";
import { useCartStore } from "./useCartStore";

export const CartSection = () => {
  const items = useStore(useCartStore, (state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalPrice = items ? numberToRupiah(getTotalPrice()) : 0;

  return (
    <>
      <div className="flex h-full flex-col gap-6 divide-y overflow-auto">
        {items ? (
          items.map((item) => <CartItem key={item.id} item={item} />)
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="sticky bottom-0 z-0 border-t p-4">
        <div className="">Total Item: {items?.length}</div>
        <div className="">Total Price: {totalPrice}</div>
        <CheckoutDrawer items={items} />
      </div>
    </>
  );
};
