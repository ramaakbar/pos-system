"use client";

import type { User } from "api/src/db/schema/users";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Loader2, Settings, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { useLogoutMutation } from "../(auth)/authHooks";

type Props = {
  user: User;
};

export const BottomNav = ({ user }: Props) => {
  const pathName = usePathname();

  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <nav className="sticky bottom-0 z-0 border-t bg-white px-4">
      <div className="mx-auto flex max-w-4xl justify-between">
        <Link href={"/"}>
          <Button
            variant="ghost"
            className={cn(
              "flex h-auto flex-col capitalize",
              pathName === "/" ? "text-blue-600" : ""
            )}
          >
            <Home className="size-5" />
            Home
          </Button>
        </Link>
        <Link href={"/transactions"}>
          <Button
            variant="ghost"
            className={cn(
              "flex h-auto flex-col capitalize",
              pathName === "/transactions" ? "text-blue-600" : ""
            )}
          >
            <Inbox className="size-5" />
            Transactions
          </Button>
        </Link>
        <Link href={"/customers"}>
          <Button
            variant="ghost"
            className={cn(
              "flex h-auto flex-col capitalize",
              pathName === "/customers" ? "text-blue-600" : ""
            )}
          >
            <UserRound className="size-5" />
            Customers
          </Button>
        </Link>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className="flex h-auto flex-col capitalize">
              <Settings className="size-5" />
              Setting
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
              <DrawerHeader>
                <DrawerTitle>Setting</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-4 p-4 pb-0">
                <Text>{user.email}</Text>
                <Button variant={"secondary"} asChild>
                  <Link href={"/dashboard"} className="w-full">
                    Go to dashboard
                  </Link>
                </Button>
                <Button
                  variant={"secondary"}
                  className="w-full"
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  {" "}
                  {isPending ? (
                    <>
                      <Loader2 className={"mr-2 inline size-4 animate-spin"} />
                      Loading...
                    </>
                  ) : (
                    <>Logout</>
                  )}
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
};
