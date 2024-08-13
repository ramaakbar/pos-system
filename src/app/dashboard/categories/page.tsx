"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";

import { DataTable } from "@/components/data-table/data-table";
import { Heading } from "@/components/ui/heading";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { client } from "@/lib/client";
import { handleResponse, sortByToState, stateToSortBy } from "@/lib/utils";

import { SearchProduct } from "../search-input";
import { getCategoryColumns } from "./columns";
import { CreateCategoryDrawer } from "./create-category-drawer";

export default function Page() {
  const [query, setQuery] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("createdAt.asc"),
    },
    {
      clearOnDefault: true,
    }
  );

  const sortingState = sortByToState(query.sort);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", query],
    queryFn: async () => {
      const res = await client.api.categories.$get({
        query: query,
      });

      return await handleResponse(res);
    },
    placeholderData: keepPreviousData,
  });

  const columns = getCategoryColumns();

  return (
    <div className="flex h-[calc(100dvh-150px)] flex-col lg:h-[calc(100dvh-50px)]">
      <Heading variant={"h3"} className="mb-5">
        Categories
      </Heading>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <SearchProduct className="" />
        <CreateCategoryDrawer />
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
    </div>
  );
}
