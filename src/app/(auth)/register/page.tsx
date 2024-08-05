import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="absolute right-0 top-0 p-4">
        <Button variant={"ghost"} asChild={true}>
          <Link href={"/login"}>
            Login <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
      <main className="mx-auto w-full max-w-lg px-4">
        <div className="mb-5 space-y-2">
          <Heading variant="h2">Register</Heading>
        </div>
        <RegisterForm />
      </main>
    </div>
  );
}
