import { useState } from "react";
import { DefaultError, useMutation } from "@tanstack/react-query";
import {
  paymentStatusEnum,
  Transaction,
  TransactionHeader,
  transactionStatusEnum,
} from "api/src/db/schema/transactions";
import { InferRequestType } from "hono/client";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Text } from "@/components/ui/text";
import { client } from "@/lib/client";
import { queryClient } from "@/lib/react-query";
import { handleResponse, numberToRupiah } from "@/lib/utils";

type Props = {
  transaction: Transaction;
};

export const TransactionDetail = ({ transaction }: Props) => {
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionHeader["transactionStatus"]
  >(transaction.transactionStatus);

  const [paymentStatus, setPaymentStatus] = useState<
    TransactionHeader["paymentStatus"]
  >(transaction.paymentStatus);

  const { mutateAsync } = useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.transactions)[":id"]["$patch"]>["json"]
  >({
    mutationFn: async (values) => {
      const res = await client.transactions[":id"].$patch({
        param: {
          id: transaction.id,
        },
        json: values,
      });

      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Heading variant={"h3"}>Transaction {transaction.code}</Heading>
        <div className="flex gap-2">
          <Badge>{transaction.transactionStatus}</Badge>
          <Badge>{transaction.paymentStatus}</Badge>
        </div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Amount
        </Heading>
        <div>{numberToRupiah(transaction.amount)}</div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Customer
        </Heading>
        <div>{transaction.customer?.name}</div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Address
        </Heading>
        <div>{transaction.address}</div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Date
        </Heading>
        <div>{new Date(transaction.createdAt).toDateString()}</div>
        <div>{new Date(transaction.date).toLocaleString()}</div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Payment Method
        </Heading>
        <div>{transaction.paymentMethod}</div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Status
        </Heading>
        <div className="mb-1">
          <Label>Transaction Status</Label>
          <NativeSelect
            className="w-full"
            data={transactionStatusEnum}
            value={transactionStatus}
            onChange={(e) => {
              const status = e.target
                .value as TransactionHeader["transactionStatus"];
              setTransactionStatus(status);
              toast.promise(
                mutateAsync({
                  transactionStatus: status,
                  paymentStatus,
                }),
                {
                  loading: "Updating...",
                  success: "Transaction Status updated",
                  error: (err) => toast.error(err),
                }
              );
            }}
          />
        </div>
        <div>
          <Label>Payment Status</Label>
          <NativeSelect
            className="w-full"
            data={paymentStatusEnum}
            value={paymentStatus}
            onChange={(e) => {
              const status = e.target
                .value as TransactionHeader["paymentStatus"];
              setPaymentStatus(status);
              toast.promise(
                mutateAsync({
                  transactionStatus,
                  paymentStatus: status,
                }),
                {
                  loading: "Updating...",
                  success: "Payment Status updated",
                  error: (err) => toast.error(err),
                }
              );
            }}
          />
        </div>
      </div>
      <div className="mb-6">
        <Heading variant={"h4"} className="mb-2">
          Products
        </Heading>
        <div className="flex flex-col gap-4">
          {transaction.detail?.map((detail) => (
            <div key={detail.id} className="flex gap-3 rounded-md border p-2">
              <img
                src={detail.product.media}
                alt={detail.product.name}
                className="size-14"
              />
              <div>
                <div>
                  <span className="mr-2 font-bold">{detail.product.name}</span>{" "}
                  <span>x{detail.quantity}</span>
                </div>
                <Text>{numberToRupiah(detail.price)}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
