import { z } from "zod";

export const createCategoryDtoSchema = z.object({
  name: z.string().min(1),
});

export const updateCategoryDtoSchema = createCategoryDtoSchema.partial({
  name: true,
});
