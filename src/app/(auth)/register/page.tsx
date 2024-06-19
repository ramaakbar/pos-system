import Link from "next/link";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="mx-auto w-full max-w-lg px-4">
        <Heading variant="h2" className="mb-5">
          Register
        </Heading>
        <div>
          <Text>
            Already have an account? <Link href={Routes.login()}>Sign In</Link>
          </Text>
        </div>
        {/* <LoginForm /> */}
      </main>
    </div>
  );
}
