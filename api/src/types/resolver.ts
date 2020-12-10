import { Request } from 'express';
import { MaybePromise } from './shared';

export type User = {
  uid: number;
};

export type AuthenticatedRequest = Exclude<Request, 'user'> & {
  user: User;
};

export type Context = { user?: User };

export type Resolver<A, T, C extends Context = Context> = (
  root: unknown,
  args: A,
  ctx: C,
) => MaybePromise<T | null>;
