"use client";

import { useRouter } from "next/navigation";
import { typeboxResolver } from "@hookform/resolvers/typebox";
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
import { loginDtoSchema } from "@/server/modules/auth/schema";

import { useRegisterMutation } from "../authHooks";

export const RegisterForm = () => {
  const { push } = useRouter();

  const form = useForm<UnwrapSchema<typeof loginDtoSchema>>({
    resolver: typeboxResolver(loginDtoSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    criteriaMode: "all",
  });

  const { mutate, isPending } = useRegisterMutation();

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
};
