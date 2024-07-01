"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { DefaultError, useMutation } from "@tanstack/react-query";
import { UnwrapSchema } from "elysia";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { Main } from "@/routes";
import { usePush } from "@/routes/hooks";
import { loginDtoSchema } from "@/server/modules/auth/schema";

export function LoginForm() {
  const pushToMain = usePush(Main);

  const form = useForm<UnwrapSchema<typeof loginDtoSchema>>({
    resolver: typeboxResolver(loginDtoSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    UnwrapSchema<typeof loginDtoSchema>
  >({
    mutationKey: ["user"],
    mutationFn: async (values) => {
      const { data, error } = await client.api.auth.login.post(values);
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: async () => {
      pushToMain({});
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutate(values))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  placeholder="hey@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2 leading-none">
                <div className="space-y-1">
                  <FormLabel>Password</FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Your password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className={"mr-2 inline size-4 animate-spin"} />
              Loading...
            </>
          ) : (
            <>Login</>
          )}
        </Button>
      </form>
    </Form>
  );
}
