"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PaginatedList } from "@/components/paginated-list";
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
import { CreateProductDrawer } from "./_products/create-product-drawer";
import SearchProduct from "./_products/search-product";

export default function Home() {
  const searchQuery = useSearchParams(Main).search || "";
  const pageQuery = useSearchParams(Main).page || 1;

  const { data, isFetching } = useQuery({
    queryKey: ["products", pageQuery, searchQuery],
    queryFn: async () => {
      const { data, error } = await client.api.products.index.get({
        query: {
          search: searchQuery,
          page: pageQuery,
        },
      });

      if (error) {
        throw error.value;
      }
      return data;
    },
    placeholderData: keepPreviousData,
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
        <div className="flex justify-between">
          <Heading variant="h2" className="mb-3">
            Products
          </Heading>
          <CreateProductDrawer />
        </div>
        <SearchProduct searchQuery={searchQuery} />
        <div className="overflow-auto">
          {isFetching && (
            <div className="my-4 flex justify-center">
              <Loader2 className={"size-16 animate-spin"} />
            </div>
          )}
          {!isFetching && (!data || data.data.length === 0) && (
            <div className="my-4 flex justify-center">No Data</div>
          )}
          <div className="mb-6 grid grid-cols-12 gap-6">
            {!isFetching &&
              data &&
              data.data.map((product) => (
                <div
                  key={product.id}
                  className="col-span-6 rounded-md border shadow-sm md:col-span-4"
                  onClick={() => handleAddItem(product)}
                >
                  <img
                    src={product.media}
                    alt={product.name}
                    className="aspect-square w-full"
                    width={300}
                    height={300}
                  />
                  <div className="p-2">
                    <Text className="font-bold">{product.name}</Text>
                    <Text>Quantity: {product.quantity}</Text>
                    <Text>{numberToRupiah(product.price)}</Text>
                  </div>
                </div>
              ))}
          </div>
          {data && (
            <PaginatedList
              totalPages={data.pagination.pageCount}
              currentPage={data.pagination.currentPage}
              className="mb-5"
              route={Main}
            />
          )}
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
