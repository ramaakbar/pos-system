"use client";

import { LoadingScreen } from "@/components/loading-screen";
import { Main } from "@/routes";
import { usePush } from "@/routes/hooks";

import { useGetCurrentUserQuery } from "./authHooks";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pushToMain = usePush(Main);

  const { data: user, isFetching } = useGetCurrentUserQuery();

  if (isFetching) {
    return <LoadingScreen />;
  }

  if (!isFetching && user) {
    pushToMain({});
  }

  return <>{children}</>;
}
