"use client";

import { useQuery } from "@tanstack/react-query";

import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import TableSkeleton from "@/components/ui/table/table-skeleton";
import { client } from "@/lib/client";

import CartSection from "./_cart/cartSection";
import { columns } from "./_products/columns";

export default function Home() {
  const { data, isPending } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await client.api.products.index.get({
        query: {},
      });

      if (error) {
        throw error.value;
      }
      return data;
    },
  });

  return (
    <div className="max-height-screen grid size-full grid-cols-12">
      <div className="max-height-screen col-span-8 flex h-full flex-col">
        <Heading variant="h2">Products</Heading>
        <Input className="mb-10 w-full" placeholder="Search" />
        <div className="overflow-scroll">
          {!isPending && data ? (
            <DataTable columns={columns} data={data.data} />
          ) : (
            <TableSkeleton col={4} row={10} />
          )}
        </div>
      </div>
      <div className="max-height-screen col-span-4 flex flex-col">
        <Heading variant="h2">Cart</Heading>
        <CartSection />
      </div>
    </div>
  );
}
