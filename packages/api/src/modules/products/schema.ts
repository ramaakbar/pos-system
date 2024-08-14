import { z } from "zod";

import { paginationQuerySchema } from "../../lib/common-schemas";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "../../lib/constants";

export const createProductDtoSchema = z.object({
  name: z.string({ message: "Name must not be empty" }),
  categoryId: z.string({ message: "Category must be selected" }),
  description: z.string().optional(),
  price: z.coerce.number().min(1, {
    message: "Price must be greater than 1",
  }),
  quantity: z.coerce.number().min(0, {
    message: "Quantity must be greater than 0",
  }),
  media: z
    .instanceof(File, {
      message: "Media is required",
    })
    .refine((file) => {
      return !file || file.size <= MAX_UPLOAD_SIZE;
    }, "File size must be less than 3MB")
    .refine((file) => {
      return ACCEPTED_FILE_TYPES.includes(file.type);
    }, "File must be a PNG or JPG/JPEG"),
});

export const updateProductDtoSchema = createProductDtoSchema.partial({
  name: true,
  categoryId: true,
  price: true,
  quantity: true,
  media: true,
});

export const getProductQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  category: z.string().optional(),
});
