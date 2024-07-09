"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { numberToRupiah } from "@/lib/utils";
import { MainTransactions } from "@/routes";
import { useSearchParams } from "@/routes/hooks";

import { TransactionPagination } from "./transaction-pagination";

export default function Page() {
  const searchQuery = useSearchParams(MainTransactions).search || "";
  const pageQuery = useSearchParams(MainTransactions).page || 1;

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", pageQuery, searchQuery],
    queryFn: async () => {
      const { data, error } = await client.api.transactions.index.get({
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
  });
  return (
    <div className="max-height-screen flex flex-col px-4 pt-4">
      <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row">
        <div className="flex flex-col">
          <Heading variant="h2">Transactions</Heading>
          <Text>View and manage your recent transactions.</Text>
        </div>
        <div className="flex gap-4">
          <Button variant={"secondary"}>Filters</Button>
          <Input placeholder="Search transactions" />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-12 gap-6 overflow-auto">
        {isLoading && "Loading..."}
        {!isLoading && (!data || data.data.length === 0) && "No Data"}
        {!isLoading &&
          data &&
          data.data.map((transaction) => (
            <div
              key={transaction.id}
              className="col-span-12 rounded-lg border p-4 shadow-sm md:col-span-6"
            >
              <div className="flex justify-between">
                <Heading variant={"h3"}>{transaction.code}</Heading>
                <div className="flex gap-2">
                  <Badge>{transaction.transactionStatus}</Badge>
                  <Badge>{transaction.paymentStatus}</Badge>
                </div>
              </div>
              <div>
                <Text>{transaction.customer?.name}</Text>
                <Text>{numberToRupiah(transaction.amount)}</Text>
                <Text>{new Date(transaction.createdAt).toDateString()}</Text>
              </div>
            </div>
          ))}
      </div>
      {data && (
        <TransactionPagination
          totalPages={data.pagination.pageCount}
          currentPage={data.pagination.currentPage}
          className="mb-5"
        />
      )}
    </div>
  );
}
