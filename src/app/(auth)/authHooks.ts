import { useRouter } from "next/navigation";
import {
  DefaultError,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UnwrapSchema } from "elysia";

import { client } from "@/lib/client";
import { loginDtoSchema } from "@/server/modules/auth/schema";

export const useGetCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data, error } = await client.api.auth.me.get();

      if (error) {
        return null;
      }
      return data.user;
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    unknown,
    DefaultError,
    UnwrapSchema<typeof loginDtoSchema>
  >({
    mutationKey: ["register"],
    mutationFn: async (values) => {
      const { data, error } = await client.api.auth.login.post(values);
      if (error) {
        throw error.value;
      }
      return data;
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
    UnwrapSchema<typeof loginDtoSchema>
  >({
    mutationKey: ["login"],
    mutationFn: async (values) => {
      const { data, error } = await client.api.auth.register.post(values);
      if (error) {
        throw error.value;
      }
      return data;
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
    mutationKey: ["logout"],
    mutationFn: async () => {
      const { data, error } = await client.api.auth.logout.post();
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ["current-user"] });
      router.push("/");
    },
  });
};
