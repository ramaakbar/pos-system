import { useRouter } from "next/navigation";
import {
  DefaultError,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/client";
import { handleResponse } from "@/lib/utils";

export const useGetCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await client.api.auth.me.$get();

      return (await handleResponse(res)).user;
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.api.auth)["login"]["$post"]>["json"]
  >({
    mutationFn: async (values) => {
      const res = await client.api.auth.login.$post({
        json: values,
      });
      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ["current-user"] });
      router.push("/");
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    unknown,
    DefaultError,
    InferRequestType<(typeof client.api.auth)["register"]["$post"]>["json"]
  >({
    mutationFn: async (values) => {
      const res = await client.api.auth.register.$post({
        json: values,
      });
      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ["current-user"] });
      router.push("/");
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await client.api.auth.logout.$post();
      return await handleResponse(res);
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ["current-user"] });
      router.push("/");
    },
  });
};
