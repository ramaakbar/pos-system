import { type Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={column.getToggleSortingHandler()}
    >
      <span>{title}</span>
      {column.getCanSort() && column.getIsSorted() === "desc" ? (
        <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
      ) : (
        <ArrowUpDownIcon className="ml-2 size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
