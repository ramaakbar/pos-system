import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useTransactionPageQueryStates = () =>
  useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      transaction: parseAsString.withDefault(""),
    },
    {
      clearOnDefault: true,
    }
  );
