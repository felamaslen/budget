import { Id } from './shared';

export type LoginResponse = {
  uid: Id;
  apiKey: string;
  name: string;
  expires: string;
};
