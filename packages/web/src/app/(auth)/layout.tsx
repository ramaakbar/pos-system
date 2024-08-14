"use client";

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/loading-screen";

import { useGetCurrentUserQuery } from "./authHooks";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: user, isFetching } = useGetCurrentUserQuery();

  if (isFetching) {
    return <LoadingScreen />;
  }

  if (!isFetching && user) {
    router.push("/dashboard");
  }

  if (!isFetching && !user) {
    return <>{children}</>;
  }
}
