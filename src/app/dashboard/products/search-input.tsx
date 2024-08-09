"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export const SearchProduct = ({ className }: { className?: string }) => {
  const [query, setQuery] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
    },
    {
      clearOnDefault: true,
    }
  );
  const [search, setSearch] = useState(query.search);

  const [, cancel] = useDebounce(
    () => {
      if (search !== query.search) {
        setQuery({
          search: search,
          page: 1,
        });
      }
    },
    1000,
    [search]
  );

  useEffect(() => {
    setSearch(query.search);
  }, [query.search]);

  return (
    <div className="relative w-full md:max-w-[300px]">
      <div className="absolute inset-y-0 left-2 z-10 flex h-full items-center justify-center">
        <SearchIcon className="text-foregroond/50 size-4" />
      </div>
      <Input
        className={cn("pl-8", className)}
        value={search}
        placeholder="Search by product name"
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};
