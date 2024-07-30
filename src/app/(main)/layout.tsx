"use client";

import { LoadingScreen } from "@/components/loading-screen";
import { AuthLogin } from "@/routes";
import { usePush } from "@/routes/hooks";

import { useGetCurrentUserQuery } from "../(auth)/authHooks";
import { BottomNav } from "./bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pushToLogin = usePush(AuthLogin);

  const { data: user, isFetching, isError } = useGetCurrentUserQuery();

  if (isFetching) {
    return <LoadingScreen />;
  }

  if ((!isFetching && !user) || isError) {
    pushToLogin({});
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
