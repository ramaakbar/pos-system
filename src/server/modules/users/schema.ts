import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { usersTable } from "@/server/db/schema/users";

export const apiUserSchema = createSelectSchema(usersTable, {
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
}).omit({
  password: true,
});
