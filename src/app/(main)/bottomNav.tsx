"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, Settings, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { Routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { User } from "@/server/db/schema/users";

import { logout } from "../actions";

type Props = {
  user: User;
};

export default function BottomNav({ user }: Props) {
  const pathName = usePathname();

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
      href: Routes.home(),
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
                <form action={logout}>
                  <Button>Logout</Button>
                </form>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}
