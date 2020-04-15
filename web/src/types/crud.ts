export type Create<V> = Omit<V, 'id'>;

export type CreateEdit<V> = V | Create<V>;

export enum RequestType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type WithCrud<V> = V & { __optimistic?: RequestType };
