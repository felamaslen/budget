import { Request } from 'express';
import { MaybePromise } from './shared';

export type User = {
  uid?: number;
};

export const isUserDefined = (user: Required<User> | User | undefined): user is Required<User> =>
  !!user?.uid;

export type Context = Request;

export type Resolver<A, T, C extends Context = Context> = (
  root: unknown,
  args: A,
  ctx: C,
) => MaybePromise<T | null>;
