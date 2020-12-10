import { Id } from './shared';

export type Create<V> = Omit<V, 'id'>;
export type CreateEdit<V> = V | Create<V>;

export type Delta<I> = Partial<Create<I>>;

export const enum RequestType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type RawDate<V, K extends keyof V> = V extends { [key in K]: Date }
  ? Omit<V, K> & { [key in K]: string }
  : V;

export type NativeDate<V, K extends keyof V> = V extends { [key in K]: string }
  ? Omit<V, K> & { [key in K]: Date }
  : V;

export type IdKey = 'id' | 'fakeId';

export interface Item {
  id: Id;
}

export type WithIds<I extends Record<string, unknown>> = I & Item;

export type SetActiveId = (id: Id | null) => void;
