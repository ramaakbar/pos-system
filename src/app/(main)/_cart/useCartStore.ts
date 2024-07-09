import { toast } from "sonner";
import { ulid } from "ulid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Product } from "@/server/db/schema/products";

export type Item = {
  id: string;
  product: Product;
  quantity: number;
};

type CartStore = {
  items: Array<Item>;
  addItem: (item: Omit<Item, "id">) => void;
  removeItem: (id: string) => void;
  removeAllItem: () => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  getTotalPrice: () => number;
};

const findItemIndex = (items: Item[], id: string) =>
  items.findIndex((item) => item.id === id);

const updateItemQuantity = (
  items: Item[],
  id: string,
  amount: number,
  maxQuantity: number
) => {
  return items.map((item) => {
    if (item.id === id) {
      const newQuantity = item.quantity + amount;
      if (newQuantity > maxQuantity) {
        toast.error("Quantity exceeded");
        return item;
      }
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const foundItem = state.items.find(
            (val) => val.product.id === item.product.id
          );

          if (!foundItem) {
            if (item.product.quantity === 0) {
              toast.error("Item is Out of Stock");
              return { ...item };
            }

            toast.success("Successfully add item to cart");
            return {
              items: [...state.items, { id: ulid(), ...item }],
            };
          }

          return {
            items: updateItemQuantity(
              state.items,
              foundItem.id,
              1,
              foundItem.product.quantity
            ),
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      removeAllItem: () =>
        set(() => ({
          items: [],
        })),
      incrementQuantity: (id) =>
        set((state) => ({
          items: updateItemQuantity(
            state.items,
            id,
            1,
            state.items[findItemIndex(state.items, id)].product.quantity
          ),
        })),
      decrementQuantity: (id) =>
        set((state) => ({
          items: state.items.reduce<Array<Item>>((acc, item) => {
            if (item.id === id) {
              const newQuantity = item.quantity - 1;
              if (newQuantity > 0) {
                acc.push({ ...item, quantity: newQuantity });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, []),
        })),
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
