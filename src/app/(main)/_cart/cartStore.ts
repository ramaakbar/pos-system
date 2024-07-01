import { ulid } from "ulid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Product } from "@/server/db/schema/products";

type Item = {
  id: string;
  product: Product;
  quantity: number;
};

type CartStore = {
  items: Array<Item>;
  addItem: (item: Omit<Item, "id">) => void;
  removeItem: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { id: ulid(), ...item }],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      incrementQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
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
