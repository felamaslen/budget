export type Create<V> = Omit<V, 'id'>;

export type CreateEdit<V> = V | Create<V>;

export enum RequestType {
  create = 'CREATE',
  update = 'UPDATE',
  delete = 'DELETE',
}

export type WithCrud<V> = V & { __optimistic?: RequestType };

export type RawDate<V> = Omit<V, 'date'> & { date: string };
