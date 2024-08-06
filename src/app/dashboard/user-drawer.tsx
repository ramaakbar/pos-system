import Link from "next/link";
import { ChevronRightIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { User } from "@/server/db/schema/users";

import { useLogoutMutation } from "../(auth)/authHooks";

type Props = {
  user: User;
};

export const UserDrawer = ({ user }: Props) => {
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="flex h-auto w-full justify-between">
          {user.email}
          <ChevronRightIcon className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-md flex-col overflow-auto rounded-t-[10px] p-4">
          <DrawerHeader>
            <DrawerTitle>{user.email}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 p-4 pb-0">
            <Button variant={"secondary"} asChild>
              <Link href={"/"} className="w-full">
                Go to home
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
  );
};
