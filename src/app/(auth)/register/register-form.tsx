"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultError, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Routes } from "@/lib/routes";
import { client } from "@/server/client";
import { loginDtoSchema } from "@/server/modules/auth/schema";

export function RegisterForm() {
  const { push } = useRouter();

  const form = useForm<z.infer<typeof loginDtoSchema>>({
    resolver: zodResolver(loginDtoSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    DefaultError,
    z.infer<typeof loginDtoSchema>
  >({
    mutationKey: ["user"],
    mutationFn: (values) =>
      client.api.auth.register.$post({
        json: values,
      }),
    onSuccess: async () => {
      push(Routes.home());
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
            <>Register</>
          )}
        </Button>
      </form>
    </Form>
  );
}
