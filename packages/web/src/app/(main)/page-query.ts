import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useProductPageQueryStates = () =>
  useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      category: parseAsString.withDefault(""),
    },
    {
      clearOnDefault: true,
    }
  );
