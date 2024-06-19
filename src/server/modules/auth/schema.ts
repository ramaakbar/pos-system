import { z } from "zod";

export const registerDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(64, { message: "Password must be at most 64 characters." }),
});

export const loginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password can not be empty." }),
});
