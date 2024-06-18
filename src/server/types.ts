import { OpenAPIHono } from "@hono/zod-openapi";
import { Schema } from "hono";
import { Session, User } from "lucia";

export type ContextVariables = {
  user: User;
  session: Session;
};

export type Env = {
  Variables: ContextVariables;
};

export class CustomHono<
  E extends Env = Env,
  S extends Schema = {},
  BasePath extends string = "/",
> extends OpenAPIHono<E, S, BasePath> {}

export type NonEmptyArray<T> = readonly [T, ...T[]];
