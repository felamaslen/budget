import { Item } from './shared';

export type Create<V> = Omit<V, 'id'>;
export type CreateEdit<V> = V | Create<V>;

export type Delta<I> = Partial<Create<I>>;
export type DeltaEdit<I> = Partial<CreateEdit<I>>;

export const enum RequestType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type Request = {
  route: string;
  method: 'post' | 'put' | 'delete';
  fakeId?: string;
  id?: string;
  type: RequestType;
  body?: object;
  query?: object;
};

export type WithCrud<V> = V & { __optimistic?: RequestType };

export type RawDate<V> = Omit<V, 'date'> & { date: string };

export type IdKey = 'id' | 'fakeId';

export type ActionCreated<T extends string, I extends Item> = {
  type: T;
  fakeId: string;
  item: Create<I>;
};

export type ActionUpdated<T extends string, I extends Item> = {
  type: T;
  id: string;
  item: Create<I>;
};

export type ActionDeleted<T extends string> = {
  type: T;
  id: string;
};
