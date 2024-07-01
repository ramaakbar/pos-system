import Link from "next/link";

import { Main } from "@/routes";

export default function Page() {
  return (
    <div>
      <Link href={Main()}></Link>
    </div>
  );
}
