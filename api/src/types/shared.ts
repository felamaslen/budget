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

export type RawDate<V, K extends string> = V extends { [key in K]: Date }
  ? Omit<V, K> & { [key in K]: string }
  : V;
export type RawDateDeep<V extends Record<string, unknown>> = {
  [K in keyof V]: V[K] extends { date: Date } ? RawDate<V[K], 'date'> : V[K];
};
