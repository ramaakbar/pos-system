"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { AuthLogin, Main } from "@/routes";
import { usePush } from "@/routes/hooks";
import { User } from "@/server/db/schema/users";

type Props = {
  user: User;
};

export default function BottomNav({ user }: Props) {
  const pathName = usePathname();
  const pushToLogin = usePush(AuthLogin);

  // interface Route {
  //   name: string;
  //   path: string;
  // }

  // const getRouteLinks = (routes: { [key: string]: () => string }): Route[] => {
  //   return Object.keys(routes).map((routeKey) => ({
  //     name: routeKey,
  //     path: routes[routeKey](),
  //   }));
  // };

  // const routeLinks = getRouteLinks(Routes);

  const routeLinks = [
    {
      name: "Home",
      href: Main(),
      icon: Home,
    },
    {
      name: "Orders",
      href: "/order",
      icon: Inbox,
    },
    {
      name: "Customers",
      href: "/customer",
      icon: UserRound,
    },
  ];

  const { mutate: logout, isPending } = useMutation({
    mutationKey: ["user"],
    mutationFn: async () => {
      const { data, error } = await client.api.auth.logout.post();
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: async () => {
      pushToLogin({});
    },
  });

  return (
    <nav className="border-t bg-white px-4">
      <div className="mx-auto flex max-w-4xl justify-between">
        {routeLinks.map((route, index) => (
          <Link href={route.href} key={route.href}>
            <Button
              variant="ghost"
              className={cn(
                "flex h-auto flex-col capitalize",
                pathName?.startsWith(route.href) ||
                  (index === 0 && pathName === "/")
                  ? "text-blue-600"
                  : ""
              )}
            >
              <route.icon className="size-5" />
              {route.name}
            </Button>
          </Link>
        ))}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className="flex h-auto flex-col capitalize">
              <Settings className="size-5" />
              Setting
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Setting</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <Text>{user.email}</Text>
                <Button onClick={() => logout()} disabled={isPending}>
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
}
