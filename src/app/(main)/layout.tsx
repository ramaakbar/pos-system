"use client";

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/loading-screen";

import { useGetCurrentUserQuery } from "../(auth)/authHooks";
import { BottomNav } from "./bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: user, isFetching, isError } = useGetCurrentUserQuery();

  if (isFetching) {
    return <LoadingScreen />;
  }

  if ((!isFetching && !user) || isError) {
    router.push("/login");
  }

  if (!isFetching && user) {
    return (
      <main className="relative z-0 flex h-full flex-col justify-between">
        <section className="mx-auto size-full max-w-7xl flex-1 px-4">
          {children}
        </section>
        <BottomNav user={user} />
      </main>
    );
  }
}
