"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { CreateProductDrawer } from "@/app/(main)/_products/create-product-drawer";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Heading } from "@/components/ui/heading";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { client } from "@/lib/client";
import { sortByToState, stateToSortBy } from "@/lib/utils";

import { getProductColumns } from "./columns";
import { SearchProduct } from "./search-input";

export default function Page() {
  const [query, setQuery] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      sort: parseAsString.withDefault("createdAt.asc"),
    },
    {
      clearOnDefault: true,
    }
  );

  const sortingState = sortByToState(query.sort);

  const columns = getProductColumns();

  const { data, isLoading } = useQuery({
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

  const { data: categories, isPending: categoryLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await client.api.categories.index.get();

      if (error) {
        throw error.value;
      }
      return data;
    },
    select: (data) => {
      return [
        { id: "", name: "Category" },
        ...data.data.map((category) => ({
          id: category.name,
          name: category.name,
        })),
      ];
    },
  });

  return (
    <div className="flex h-[calc(100dvh-150px)] flex-col lg:h-[calc(100dvh-50px)]">
      <Heading variant={"h3"} className="mb-5">
        Products
      </Heading>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <SearchProduct className="" />
        <NativeSelect
          data={categories!}
          loading={categoryLoading}
          defaultValue="default"
          onChange={(e) =>
            setQuery({
              category: e.target.value,
              page: 1,
            })
          }
          value={query.category}
        />
        <CreateProductDrawer />
      </div>
      {isLoading && <TableSkeleton col={4} row={14} />}
      {!isLoading && data && (
        <DataTable
          columns={columns}
          data={data?.data!}
          sorting={sortingState}
          onSortingChange={(updateOrValue) => {
            const newSortingState =
              typeof updateOrValue === "function"
                ? updateOrValue(sortingState)
                : updateOrValue;
            return setQuery({ sort: stateToSortBy(newSortingState) });
          }}
        />
      )}
      {data && (
        <DataTablePagination
          currentPage={data?.pagination.currentPage}
          totalPages={data?.pagination.pageCount}
          className="sticky bottom-0 bg-background"
        />
      )}
    </div>
  );
}
