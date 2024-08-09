import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { parseAsInteger, useQueryStates } from "nuqs";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  totalPages: number;
  currentPage: number;
  className?: string;
};

export const DataTablePagination = ({
  totalPages,
  currentPage,
  className,
}: Props) => {
  const [query, setQuery] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
    },
    {
      clearOnDefault: true,
    }
  );

  return (
    <div className={cn("mt-4 flex items-center justify-end px-2", className)}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={query.limit.toString()}
            onValueChange={(value) => {
              setQuery({
                limit: Number(value),
              });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={query.limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() =>
              setQuery({
                page: 1,
              })
            }
            disabled={query.page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() =>
              setQuery({
                page: currentPage - 1,
              })
            }
            disabled={query.page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() =>
              setQuery({
                page: currentPage + 1,
              })
            }
            disabled={query.page === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() =>
              setQuery({
                page: totalPages,
              })
            }
            disabled={query.page === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
