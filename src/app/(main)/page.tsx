"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PaginatedList } from "@/components/paginated-list";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { numberToRupiah } from "@/lib/utils";
import { Main } from "@/routes";
import { usePush, useSearchParams } from "@/routes/hooks";
import { Product } from "@/server/db/schema/products";

import CartDrawer from "./_cart/cart-drawer";
import CartSection from "./_cart/cart-section";
import { useCartStore } from "./_cart/useCartStore";
import { CreateProductDrawer } from "./_products/create-product-drawer";
import SearchProduct from "./_products/search-product";
import { UpdateStockDrawer } from "./_products/update-stock-drawer";

export default function Home() {
  const searchQuery = useSearchParams(Main).search || "";
  const pageQuery = useSearchParams(Main).page || 1;
  const categoryQuery = useSearchParams(Main).category || "";

  const pushMain = usePush(Main);

  const { data: products, isFetching: isFetchingProducts } = useQuery({
    queryKey: ["products", pageQuery, searchQuery, categoryQuery],
    queryFn: async () => {
      const { data, error } = await client.api.products.index.get({
        query: {
          search: searchQuery,
          page: pageQuery,
          category: categoryQuery,
        },
      });

      if (error) {
        throw error.value;
      }
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await client.api.categories.index.get();

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
        <div className="flex justify-between">
          <Heading variant="h2" className="mb-3">
            Products
          </Heading>
          <div>
            <UpdateStockDrawer />
            <CreateProductDrawer />
          </div>
        </div>
        <SearchProduct className="mb-4" searchQuery={searchQuery} />
        <div className="mb-4 overflow-auto">
          <div className="flex w-max gap-4">
            <Badge
              variant={categoryQuery === "" ? "secondary" : "outline"}
              onClick={() =>
                pushMain(
                  {},
                  {
                    search: searchQuery,
                    page: pageQuery,
                  }
                )
              }
            >
              All
            </Badge>
            {categories?.data.map((category) => (
              <Badge
                variant={
                  categoryQuery === category.name ? "secondary" : "outline"
                }
                key={category.id}
                onClick={() =>
                  pushMain(
                    {},
                    {
                      search: searchQuery,
                      page: pageQuery,
                      category: category.name,
                    }
                  )
                }
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-auto">
          {isFetchingProducts && (
            <div className="my-4 flex flex-1 items-center justify-center">
              <Loader2 className={"size-16 animate-spin"} />
            </div>
          )}
          {!isFetchingProducts && (!products || products.data.length === 0) && (
            <div className="my-4 flex flex-1 items-center justify-center">
              No Data
            </div>
          )}
          <div className="mb-6 grid grid-cols-12 gap-6">
            {!isFetchingProducts &&
              products &&
              products.data.map((product) => (
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
          {products && (
            <PaginatedList
              totalPages={products.pagination.pageCount}
              currentPage={products.pagination.currentPage}
              className="sticky bottom-0 mb-5 bg-background"
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
