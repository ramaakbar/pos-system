import { t } from "elysia";

export const registerDtoSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email",
  }),
  password: t.String({
    minLength: 8,
    maxLength: 64,
    error: "Password length must be between 8 and 64 characters",
  }),
});

export const loginDtoSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email",
  }),
  password: t.String({
    minLength: 1,
    error: "Password can not be empty",
  }),
});
