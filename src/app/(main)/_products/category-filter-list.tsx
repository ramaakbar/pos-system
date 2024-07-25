import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { client } from "@/lib/client";
import { Main } from "@/routes";
import { usePush } from "@/routes/hooks";

import { Route } from "../page.info";

type Props = {
  query: z.infer<typeof Route.search>;
};

export const CategoryFilterList = ({ query }: Props) => {
  const pushMain = usePush(Main);

  const { data, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await client.api.categories.index.get();

      if (error) {
        throw error.value;
      }
      return data;
    },
  });

  return (
    <div className="mb-4 overflow-auto">
      <div className="flex w-max gap-4">
        <Badge
          className="cursor-pointer"
          variant={query.category === "" ? "secondary" : "outline"}
          onClick={() =>
            pushMain(
              {},
              {
                ...query,
                category: undefined,
              }
            )
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
                pushMain(
                  {},
                  {
                    ...query,
                    category: category.name,
                  }
                )
              }
            >
              {category.name}
            </Badge>
          ))}
      </div>
    </div>
  );
};
