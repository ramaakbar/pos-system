"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Main } from "@/routes";
import { usePush } from "@/routes/hooks";

export default function SearchProduct({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [query, setQuery] = useState(searchQuery);
  const debounceValue = useDebounce(query, 500);
  const router = usePush(Main);

  useEffect(() => {
    router({}, { search: debounceValue });
  }, [debounceValue]);

  return (
    <Input
      className="mb-10 w-full"
      value={query}
      placeholder="Search"
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
