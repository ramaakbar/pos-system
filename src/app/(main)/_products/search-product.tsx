"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

import { useProductPageQueryStates } from "../page-query";

export const SearchProduct = ({ className }: { className: string }) => {
  const [query, setQuery] = useProductPageQueryStates();
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
    <Input
      className={cn("w-full", className)}
      value={search}
      placeholder="Search"
      onChange={(e) => setSearch(e.target.value)}
    />
  );
};
