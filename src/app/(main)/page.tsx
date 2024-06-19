import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";

import { getUser, logout } from "../actions";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    throw redirect(Routes.login());
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      {/* <header className="flex items-center justify-between border-b border-border p-4">
        <div>Test</div>
        <nav className="space-x-5">
          <Link href={"/"}>Home</Link>
          <Link href={"/"}>Products</Link>
          <Link href={"/"}>Orders</Link>
          <Link href={"/"}>Customers</Link>
        </nav>
      </header> */}
      <main className="flex-1 px-4">
        <div className="container flex h-full flex-col items-center justify-center gap-2">
          <h1 className="text-4xl font-semibold">{user.email}</h1>
          <form action={logout}>
            <Button>Logout</Button>
          </form>
        </div>
      </main>
      <nav className="border-t px-4">
        <div className="mx-auto flex max-w-4xl justify-between">
          <Link href={"/"}>
            <Button variant="ghost" className="flex h-auto flex-col">
              <HomeIcon className="size-6" />
              Home
            </Button>
          </Link>
          <Link href={"/"}>
            <Button variant="ghost" className="flex h-auto flex-col">
              <HomeIcon className="size-6" />
              Home
            </Button>
          </Link>
          <Link href={"/"}>
            <Button variant="ghost" className="flex h-auto flex-col">
              <HomeIcon className="size-6" />
              Home
            </Button>
          </Link>
          <Link href={"/"}>
            <Button variant="ghost" className="flex h-auto flex-col">
              <HomeIcon className="size-6" />
              Home
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
