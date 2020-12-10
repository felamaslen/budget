export type PickPartial<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncReturnType<T extends (...args: any) => any> = PromiseResolvedType<ReturnType<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Item = {
  id: number;
};

export type Create<V> = Omit<V, 'id'>;
export type Update<V> = Create<V> & Item;

export type RawDate<V> = V extends { date: Date } ? Omit<V, 'date'> & { date: string } : V;
export type RawDateDeep<V> = {
  [K in keyof V]: RawDate<V[K]>;
};
