export type Create<V> = Omit<V, 'id'>;
export type CreateEdit<V> = V | Create<V>;
export type Edit<V> = Create<V> & { id: string };

export enum RequestType {
  create = 'CREATE',
  update = 'UPDATE',
  delete = 'DELETE',
}

export type Request = {
  route: string;
  method: 'post' | 'put' | 'delete';
  fakeId?: string;
  id?: string;
  type: RequestType;
  body?: object;
};

export type WithCrud<V> = V & { __optimistic?: RequestType };

export type RawDate<V> = Omit<V, 'date'> & { date: string };
