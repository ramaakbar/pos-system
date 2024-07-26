"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Main } from "@/routes";
import { usePush } from "@/routes/hooks";

export const SearchProduct = ({
  searchQuery,
  className,
}: {
  searchQuery: string;
  className: string;
}) => {
  const [query, setQuery] = useState(searchQuery);
  const debounceValue = useDebounce(query, 500);
  const router = usePush(Main);

  useEffect(() => {
    router({}, { search: debounceValue });
  }, [debounceValue]);

  return (
    <Input
      className={cn("w-full", className)}
      value={query}
      placeholder="Search"
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
