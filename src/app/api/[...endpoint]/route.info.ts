import { z } from "zod";

export const Route = {
  name: "ApiEndpoint",
  params: z.object({
    endpoint: z.string().array(),
  }),
};
