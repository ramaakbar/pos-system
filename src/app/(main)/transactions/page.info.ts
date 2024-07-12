import { z } from "zod";

export const Route = {
  name: "MainTransactions",
  params: z.object({}),
  search: z.object({
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    transaction: z.string().optional(),
  }),
};
