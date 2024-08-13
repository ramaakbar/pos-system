"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { handleResponse, numberToRupiah } from "@/lib/utils";

import { PaginatedList } from "../../../components/paginated-list";
import { useTransactionPageQueryStates } from "./page-query";
import { TransactionDetailDrawer } from "./transaction-detail-drawer";

export default function Page() {
  const [query, setQuery] = useTransactionPageQueryStates();

  const { data, isFetching } = useQuery({
    queryKey: ["transactions", { page: query.page, search: query.search }],
    queryFn: async () => {
      const res = await client.api.transactions.$get({
        query: {
          search: query.search,
          page: String(query.page),
        },
      });

      return await handleResponse(res);
    },
  });

  const handleCloseDrawer = () => {
    setQuery({
      transaction: "",
    });
  };

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
      <div className="flex-1 overflow-auto">
        {isFetching && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className={"size-16 animate-spin"} />
          </div>
        )}
        {!isFetching && (!data || data.data.length === 0) && (
          <div className="flex h-full items-center justify-center">No Data</div>
        )}
        {!isFetching && data && (
          <div className="mb-6 grid grid-cols-12 gap-6">
            {data.data.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => setQuery({ transaction: transaction.id })}
                className="col-span-12 h-max cursor-pointer rounded-lg border p-4 shadow-sm md:col-span-6"
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
              </div>
            ))}
          </div>
        )}
      </div>
      {data && (
        <TransactionDetailDrawer
          transactionId={query.transaction}
          handleClose={handleCloseDrawer}
        />
      )}
      {data && (
        <PaginatedList
          totalPages={data.pagination.pageCount}
          currentPage={data.pagination.currentPage}
          className="sticky bottom-0 mb-5 bg-background"
        />
      )}
    </div>
  );
}
