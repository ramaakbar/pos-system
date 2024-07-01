import { z } from "zod";

export const Route = {
  name: "Main",
  params: z.object({}),
  search: z.object({
    search: z.string().optional(),
  }),
};
