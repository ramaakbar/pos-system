"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { handleResponse } from "@/lib/utils";

import { TransactionDetail } from "./transaction-detail";

export const TransactionDetailDrawer = ({
  transactionId,
  handleClose,
}: {
  transactionId: string;
  handleClose: () => void;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (transactionId != "") {
      setOpen(true);
    }
  }, [transactionId]);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: async () => {
      const res = await client.transactions[":id"].$get({
        param: {
          id: transactionId,
        },
      });

      return await handleResponse(res);
    },
    enabled: open,
  });

  return (
    <Drawer open={open} onOpenChange={setOpen} onClose={handleClose}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="hidden">
          Transaction
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <div className="p-4 pb-0">
            {isLoading && <Text>Loading...</Text>}
            {!isLoading && !data && <Text>No Data</Text>}
            {!isLoading && data && (
              <TransactionDetail transaction={data.data} />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
