"use client";

import { useQuery } from "@tanstack/react-query";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { numberToRupiah } from "@/lib/utils";
import { Main } from "@/routes";
import { useSearchParams } from "@/routes/hooks";
import { Product } from "@/server/db/schema/products";

import CartDrawer from "./_cart/cart-drawer";
import CartSection from "./_cart/cart-section";
import { useCartStore } from "./_cart/useCartStore";
import SearchProduct from "./_products/search-product";

export default function Home() {
  const searchQuery = useSearchParams(Main).search || "";

  const { data, isPending } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: async () => {
      const { data, error } = await client.api.products.index.get({
        query: {
          search: searchQuery,
        },
      });

      if (error) {
        throw error.value;
      }
      return data;
    },
  });

  const addItem = useCartStore((state) => state.addItem);

  const handleAddItem = (data: Product) => {
    addItem({
      product: data,
      quantity: 1,
    });
  };

  return (
    <div className="max-height-screen relative grid size-full grid-cols-12 gap-6">
      <div className="max-height-screen col-span-12 flex h-full flex-col md:col-span-8">
        <Heading variant="h2" className="mb-3">
          Products
        </Heading>
        <SearchProduct searchQuery={searchQuery} />
        <div className="overflow-auto">
          <div className="grid grid-cols-12 gap-6">
            {!isPending && data
              ? data.data.map((product) => (
                  <div
                    key={product.id}
                    className="col-span-6 rounded-md border shadow-sm md:col-span-4"
                    onClick={() => handleAddItem(product)}
                  >
                    <img
                      src={"/uploads/cookie-sample.jpg"}
                      alt={product.name}
                      className="w-full"
                      width={300}
                      height={300}
                    />
                    <div className="p-2">
                      <Text className="font-bold">{product.name}</Text>
                      <Text>Quantity: {product.quantity}</Text>
                      <Text>{numberToRupiah(product.price)}</Text>
                    </div>
                  </div>
                ))
              : "nodata"}
          </div>
        </div>
        <div className="block p-4 md:hidden">
          <CartDrawer />
        </div>
      </div>
      <div className="max-height-screen col-span-4 hidden flex-col md:flex">
        <Heading variant="h2">Cart</Heading>
        <CartSection />
      </div>
    </div>
  );
}
