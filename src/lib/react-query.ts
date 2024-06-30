import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (err) => {
      toast.error(`Error : ${err.message}`);
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  }),
});
