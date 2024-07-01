"use client";

import { Button } from "@/components/ui/button";
import useStore from "@/hooks/useStore";

import { useCartStore } from "./cartStore";

type Props = {};

export default function CartSection({}: Props) {
  const items = useStore(useCartStore, (state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);

  const priceFormatter = new Intl.NumberFormat(
    new Intl.NumberFormat().resolvedOptions().locale,
    {
      style: "currency",
      currency: "IDR",
    }
  );

  const totalPrice = items ? priceFormatter.format(getTotalPrice()) : 0;

  return (
    <>
      <div className="flex h-full flex-col gap-6 divide-y overflow-auto">
        {items ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-6">
              <Button size={"icon"} onClick={() => decrementQuantity(item.id)}>
                -
              </Button>
              <div>
                {item.product.name} - {item.quantity}
              </div>
              <Button size={"icon"} onClick={() => incrementQuantity(item.id)}>
                +
              </Button>
            </div>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="sticky bottom-0 z-0 p-4">
        <div className="">Total Item: {items?.length}</div>
        <div className="">Total Price: {totalPrice}</div>
        <Button className="w-full">Checkout</Button>
      </div>
    </>
  );
}
