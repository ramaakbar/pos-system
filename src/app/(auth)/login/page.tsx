import Link from "next/link";
import { redirect } from "next/navigation";

import { getUser } from "@/app/actions";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Routes } from "@/lib/routes";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getUser();

  if (user) throw redirect(Routes.home());

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="mx-auto w-full max-w-lg px-4">
        <div className="mb-5 space-y-2">
          <Heading variant="h2">Login</Heading>
          <div>
            <Text>
              Dont have an account?{" "}
              <Link
                href={Routes.register()}
                className="text-accent-foreground hover:underline"
              >
                Sign up
              </Link>
            </Text>
          </div>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
