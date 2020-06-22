import { Id, Item } from './shared';

export type Create<V> = Omit<V, 'id'>;
export type CreateEdit<V> = V | Create<V>;

export type CrudItem<T extends object> = T & Item;

export type Delta<I> = Partial<Create<I>>;
export type DeltaEdit<I> = Partial<CreateEdit<I>>;

export const enum RequestType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type Request<B extends object = object> = {
  route: string;
  method: 'post' | 'put' | 'delete';
  fakeId?: number;
  id?: number;
  type: RequestType;
  body?: B;
  query?: object;
};

export type RawDate<V> = Omit<V, 'date'> & { date: string };

export type IdKey = 'id' | 'fakeId';

export type ActionCreated<T extends string, I extends Item> = {
  type: T;
  fakeId: number;
  item: Create<I>;
};

export type ActionUpdated<T extends string, I extends Item> = {
  type: T;
  id: Id;
  item: Create<I>;
};

export type ActionDeleted<T extends string> = {
  type: T;
  id: Id;
};
