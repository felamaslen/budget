import { Id } from './shared';

export type Create<V> = Omit<V, 'id'>;
export type CreateEdit<V> = V | Create<V>;

export type Delta<I> = Partial<Create<I>>;

export const enum RequestType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type IdKey = 'id' | 'fakeId';

export interface Item {
  id: Id;
}

export type WithIds<I extends Record<string, unknown>> = I & Item;

export type SetActiveId = (id: Id | null) => void;
