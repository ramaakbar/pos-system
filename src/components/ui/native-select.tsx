import * as React from "react";

import { cn } from "@/lib/utils";

export type NativeSelectProps<T> = React.ComponentProps<"select"> & {
  data: readonly T[] | Array<T>;
};

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  NativeSelectProps<any>
>(({ className, data, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition duration-200 ease-in-out placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {data.map((item, index) => (
        <option key={index}>{item}</option>
      ))}
    </select>
  );
});
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
