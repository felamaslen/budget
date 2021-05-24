export type RequiredNotNull<T> = T extends Record<string, unknown>
  ? Required<
      {
        [K in keyof T]: RequiredNotNull<T[K]>;
      }
    >
  : NonNullable<T>;

export type PickUnion<T extends Record<string, unknown>, K extends keyof T> = { [P in K]: T[P] };
export type PickRequire<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type PickPartial<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type GQLShallow<T> = Omit<T, '__typename'>;

export type GQL<T> = T extends Record<string, unknown>
  ? { [K in keyof GQLShallow<T>]: GQL<T[K]> }
  : T;

export type RawDate<V, K extends string> = V extends { [key in K]: Date }
  ? Omit<V, K> & { [key in K]: string }
  : V;

export type RawDateDeep<V extends Record<string, unknown>> = {
  [K in keyof V]: V[K] extends { date: Date } ? RawDate<V[K], 'date'> : V[K];
};

export type NativeDate<V, K extends keyof V> = V extends { [key in K]: string }
  ? Omit<V, K> & { [key in K]: Date }
  : V;
