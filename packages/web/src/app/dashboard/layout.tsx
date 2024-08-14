"use client";

import { UrlObject } from "url";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/loading-screen";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

import { useGetCurrentUserQuery } from "../(auth)/authHooks";
import { UserDrawer } from "./user-drawer";

const dashboardLink: Array<{
  id: number;
  name: string;
  link: UrlObject | __next_route_internal_types__.RouteImpl<UrlObject>;
}> = [
  {
    id: 1,
    name: "Overview",
    link: "/dashboard",
  },
  {
    id: 2,
    name: "Products",
    link: "/dashboard/products",
  },
  {
    id: 2,
    name: "Categories",
    link: "/dashboard/categories",
  },
  {
    id: 3,
    name: "Orders",
    link: "/dashboard/orders",
  },
  {
    id: 4,
    name: "Customers",
    link: "/dashboard/customers",
  },
  {
    id: 5,
    name: "Users",
    link: "/",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const pathName = usePathname();

  const { data: user, isFetching, isError } = useGetCurrentUserQuery();

  if (isFetching) {
    return <LoadingScreen />;
  }

  if ((!isFetching && !user) || isError) {
    router.push("/login");
  }

  if (!isFetching && user) {
    if (user.role !== "Admin") {
      router.push("/");
    }

    return (
      <div className="mx-auto max-w-screen-2xl">
        <header className="sticky inset-x-0 top-0 z-10 flex w-full flex-col gap-2 border-b bg-background p-4 lg:hidden">
          <div className="flex w-full items-center justify-between">
            <Heading variant={"h2"} className="px-3 text-xl">
              Dashboard
            </Heading>
            <div>
              <UserDrawer user={user} />
            </div>
          </div>
          <div className="overflow-auto">
            <div className="flex w-max gap-4">
              {dashboardLink.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className={cn(
                    "rounded-lg px-2 py-1 font-medium text-foreground/50 transition hover:bg-gray-100 hover:text-foreground",
                    pathName === item.link ? "bg-gray-100 text-foreground" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </header>
        <aside className="hidden bg-background lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-72 lg:flex-col">
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto border-r p-4">
            <Heading variant={"h2"} className="px-3">
              Dashboard
            </Heading>
            <nav className="flex flex-1 flex-col gap-4">
              {dashboardLink.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className={cn(
                    "rounded-lg px-3 py-2 font-medium text-foreground/50 transition hover:bg-gray-100 hover:text-foreground",
                    pathName === item.link ? "bg-gray-100 text-foreground" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="">
              <UserDrawer user={user} />
            </div>
          </div>
        </aside>
        <main className="lg:pl-72">
          <div className="relative p-4 lg:px-10 lg:pt-6">{children}</div>
        </main>
      </div>
    );
  }
}
