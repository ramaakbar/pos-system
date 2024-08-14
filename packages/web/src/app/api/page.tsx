import { redirect } from "next/navigation";

export default function Page() {
  redirect("/api/docs");
  return <div>Page</div>;
}
