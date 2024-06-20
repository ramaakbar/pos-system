import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Routes } from "@/lib/routes";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getUser();

  if (user) throw redirect(Routes.home());

  return (
    <div className="flex h-full items-center justify-center">
      <div className="absolute right-0 top-0 p-4">
        <Button variant={"ghost"} asChild={true}>
          <Link href={Routes.register()}>
            Register <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
      <main className="mx-auto w-full max-w-lg px-4">
        <div className="mb-5 space-y-2">
          <Heading variant="h2">Login</Heading>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
