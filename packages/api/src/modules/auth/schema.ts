import { z } from "zod";

export const registerDtoSchema = z.object({
  email: z.string().email({
    message: "Invalid email",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be greater than 8 chars",
    })
    .max(64, {
      message: "Password must be less then 64 chars",
    }),
});

export const loginDtoSchema = z.object({
  email: z.string().email({
    message: "Invalid email",
  }),
  password: z.string().min(1, {
    message: "Password can not be empty",
  }),
});
