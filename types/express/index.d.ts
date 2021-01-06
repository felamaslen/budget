import { User } from '~api/types/resolver';

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
