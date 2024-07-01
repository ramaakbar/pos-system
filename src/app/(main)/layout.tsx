import { redirect } from "next/navigation";

import { AuthLogin } from "@/routes";

import { getUser } from "../actions";
import BottomNav from "./bottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    throw redirect(AuthLogin());
  }

  return (
    <main className="relative z-0 flex h-full flex-col justify-between">
      <section className="mx-auto size-full max-w-7xl flex-1 px-4">
        {children}
      </section>
      <BottomNav user={user} />
    </main>
  );
}
