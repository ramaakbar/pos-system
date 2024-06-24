"use client";

import { useQuery } from "@tanstack/react-query";

import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import TableSkeleton from "@/components/ui/table/table-skeleton";
import { client } from "@/server/client";

import { columns } from "./_products/columns";

export default function Home() {
  const { data, isPending, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await client.api.products.$get({
        query: {
          page: "1",
        },
      });
      if (res.ok) {
        return await res.json();
      }
      const error = (await res.json()).error.message;
      throw new Error(error);
    },
  });

  return (
    <div className="max-height-screen grid size-full grid-cols-12">
      <div className="max-height-screen col-span-8 flex h-full flex-col overflow-scroll">
        <Heading variant="h2">Products</Heading>
        <Input className="mb-10 w-full" placeholder="Search" />
        {!isPending && data ? (
          <DataTable columns={columns} data={data.data} />
        ) : (
          <TableSkeleton col={4} row={10} />
        )}
      </div>
      <div className="col-span-4 flex flex-col">
        <Heading variant="h2">Cart</Heading>
      </div>
    </div>
  );
}
