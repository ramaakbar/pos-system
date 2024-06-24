import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { productsTable } from "@/server/db/schema/products";

const MAX_FILE_SIZE = 2000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createProductDtoSchema = createInsertSchema(productsTable, {
  categoryId: z.coerce.number().gte(0),
  price: z.coerce.number().gte(0),
  quantity: z.coerce.number(),
  media: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
}).pick({
  name: true,
  categoryId: true,
  description: true,
  price: true,
  quantity: true,
  media: true,
});

export const updateProductDtoSchema = createProductDtoSchema.partial();
