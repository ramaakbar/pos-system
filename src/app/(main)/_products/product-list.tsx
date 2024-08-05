import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PaginatedList } from "@/components/paginated-list";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { numberToRupiah } from "@/lib/utils";
import { Product } from "@/server/db/schema/products";

import { useCartStore } from "../_cart/useCartStore";
import { useProductPageQueryStates } from "../page-query";

export const ProductList = () => {
  const [query, setQuery] = useProductPageQueryStates();

  const { data, isFetching } = useQuery({
    queryKey: ["products", query],
    queryFn: async () => {
      const { data, error } = await client.api.products.index.get({
        query: query,
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
    <div className="flex flex-1 flex-col overflow-auto">
      {isFetching && (
        <div className="my-4 flex flex-1 items-center justify-center">
          <Loader2 className={"size-16 animate-spin"} />
        </div>
      )}
      {!isFetching && (!data || data.data.length === 0) && (
        <div className="my-4 flex flex-1 items-center justify-center">
          No Data
        </div>
      )}
      <div className="mb-6 grid grid-cols-12 gap-6">
        {!isFetching &&
          data &&
          data.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleOnClick={handleAddItem}
            />
          ))}
      </div>
      {data && (
        <PaginatedList
          totalPages={data.pagination.pageCount}
          currentPage={data.pagination.currentPage}
          className="sticky bottom-0 mb-5 bg-background"
        />
      )}
    </div>
  );
};

type ProductCardProps = {
  product: Product;
  handleOnClick: (item: Product) => void;
};

export const ProductCard = ({ product, handleOnClick }: ProductCardProps) => {
  return (
    <div
      key={product.id}
      className="col-span-6 rounded-md border shadow-sm md:col-span-4"
      onClick={() => handleOnClick(product)}
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
  );
};
