export type Create<V> = Omit<V, 'id'>;

export type CreateEdit<V> = V | Create<V>;

export type WithCrud<V> = V & { __optimistic?: string };
