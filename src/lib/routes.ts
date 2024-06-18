// https://www.flightcontrol.dev/blog/fix-nextjs-routing-to-have-full-type-safety

import queryString from "query-string";
import { z } from "zod";

export const Routes = {
  home: makeRoute(() => "/"),
};

type RouteBuilder<Params extends z.ZodSchema, Search extends z.ZodSchema> = {
  (p?: z.input<Params>, options?: { search?: z.input<Search> }): string;
  params: z.output<Params>;
};

function makeRoute<Params extends z.ZodSchema, Search extends z.ZodSchema>(
  fn: (p: z.input<Params>) => string,
  _paramsSchema: Params = z.object({}) as unknown as Params,
  _search: Search = z.object({}) as unknown as Search
): RouteBuilder<Params, Search> {
  const routeBuilder: RouteBuilder<Params, Search> = (params, options) => {
    const baseUrl = fn(params);
    const searchString =
      options?.search && queryString.stringify(options.search);
    return [baseUrl, searchString ? `?${searchString}` : ""].join("");
  };

  // set the type
  routeBuilder.params = undefined as z.output<Params>;
  // set the runtime getter
  Object.defineProperty(routeBuilder, "params", {
    get() {
      throw new Error(
        "Routes.[route].params is only for type usage, not runtime. Use it like `typeof Routes.[routes].params`"
      );
    },
  });

  return routeBuilder;
}
