import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { client } from "@/lib/client";
import { handleResponse } from "@/lib/utils";

import { useProductPageQueryStates } from "../page-query";

export const CategoryFilterList = () => {
  const [query, setQuery] = useProductPageQueryStates();

  const { data, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await client.api.categories.$get({
        query: {},
      });

      return await handleResponse(res);
    },
  });

  return (
    <div className="mb-4 overflow-auto">
      <div className="flex w-max gap-4">
        <Badge
          className="cursor-pointer"
          variant={query.category === "" ? "secondary" : "outline"}
          onClick={() =>
            setQuery({
              page: 1,
              category: "",
            })
          }
        >
          All
        </Badge>
        {!isFetching &&
          data &&
          data.data.map((category) => (
            <Badge
              className="cursor-pointer"
              variant={
                query.category === category.name ? "secondary" : "outline"
              }
              key={category.id}
              onClick={() =>
                setQuery({
                  page: 1,
                  category: category.name,
                })
              }
            >
              {category.name}
            </Badge>
          ))}
      </div>
    </div>
  );
};
