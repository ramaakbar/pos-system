import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { numberToRupiah } from "@/lib/utils";

import { Item, useCartStore } from "./useCartStore";

type Props = {
  item: Item;
};

export default function CartItem({ item }: Props) {
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);

  return (
    <div className="flex items-center gap-6">
      <Button
        variant={"secondary"}
        size={"icon"}
        onClick={() => decrementQuantity(item.id)}
      >
        -
      </Button>
      <div>
        <Text className="flex">
          <span className="mr-2 font-bold">{item.product.name}</span>{" "}
          <span>x{item.quantity}</span>
        </Text>
        <Text>{numberToRupiah(item.product.price)}</Text>
      </div>
      <Button
        variant={"secondary"}
        size={"icon"}
        onClick={() => incrementQuantity(item.id)}
      >
        +
      </Button>
    </div>
  );
}
