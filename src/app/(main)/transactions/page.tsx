"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { numberToRupiah } from "@/lib/utils";
import { MainTransactions } from "@/routes";
import { useSearchParams } from "@/routes/hooks";

import { PaginatedList } from "../../../components/paginated-list";
import { TransactionDetailDrawer } from "./transaction-detail-drawer";

export default function Page() {
  const searchQuery = useSearchParams(MainTransactions).search || "";
  const pageQuery = useSearchParams(MainTransactions).page || 1;

  const { data, isFetching } = useQuery({
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
      {isFetching && (
        <div className="my-4 flex justify-center">
          <Loader2 className={"size-16 animate-spin"} />
        </div>
      )}
      {!isFetching && (!data || data.data.length === 0) && (
        <div className="my-4 flex justify-center">No Data</div>
      )}
      <div className="mb-6 grid grid-cols-12 gap-6 overflow-auto">
        {!isFetching &&
          data &&
          data.data.map((transaction) => (
            <Link
              href={MainTransactions(
                {},
                {
                  transaction: transaction.id,
                }
              )}
              key={transaction.id}
              className="col-span-12 rounded-lg border p-4 shadow-sm md:col-span-6"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between">
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
            </Link>
          ))}
      </div>
      {data && <TransactionDetailDrawer />}
      {data && (
        <PaginatedList
          totalPages={data.pagination.pageCount}
          currentPage={data.pagination.currentPage}
          className="mb-5"
          route={MainTransactions}
        />
      )}
    </div>
  );
}
