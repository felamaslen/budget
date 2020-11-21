import { Request } from 'express';

export type User = {
  uid: number;
};

export type AuthenticatedRequest = Exclude<Request, 'user'> & {
  user: User;
};

export type Context = Request | AuthenticatedRequest;
