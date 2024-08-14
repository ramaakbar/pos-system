import * as React from "react";

import { cn } from "@/lib/utils";

export type NativeSelectProps<T> = React.ComponentProps<"select"> & {
  data: readonly T[] | Array<T>;
  loading?: boolean;
};

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  NativeSelectProps<any>
>(({ className, data, loading = false, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition duration-200 ease-in-out placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {loading ? (
        <option>Loading...</option>
      ) : (
        <>
          {data.length === 0 ? (
            <option>No options available</option>
          ) : (
            data.map((item, index) =>
              typeof item === "object" ? (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ) : (
                <option key={item} value={item}>
                  {item}
                </option>
              )
            )
          )}
        </>
      )}
    </select>
  );
});
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
