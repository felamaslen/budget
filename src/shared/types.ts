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

export type Create<V> = Omit<V, 'id'>;

export type OmitDeep<T, U extends string> = T extends Record<string, unknown>
  ? { [K in keyof Omit<T, U>]: OmitDeep<T[K], U> }
  : T extends Record<string, unknown>[]
  ? OmitDeep<T[0], U>[]
  : T;

export type OptionalDeep<T, U extends string> = T extends Record<string, unknown>
  ? U extends keyof T
    ? { [K in keyof Omit<T, U>]: OptionalDeep<T[K], U> } &
        Partial<{ [K in U]: NonNullable<OptionalDeep<T[K], U>> }>
    : { [K in keyof T]: OptionalDeep<T[K], U> }
  : T extends Record<string, unknown>[]
  ? OptionalDeep<T[0], U>[]
  : T;

export type GQLShallow<T> = Omit<T, '__typename'>;
export type GQL<T> = OmitDeep<T, '__typename'>;

export type RawDate<V, K extends string> = V extends { [key in K]: Date }
  ? Omit<V, K> & { [key in K]: string }
  : V;

export type RawDateDeep<V extends Record<string, unknown>> = {
  [K in keyof V]: V[K] extends { date: Date } ? RawDate<V[K], 'date'> : V[K];
};

export type NativeDate<V, K extends keyof V> = V extends { [key in K]: string }
  ? Omit<V, K> & { [key in K]: Date }
  : V extends { [key in K]?: string | null }
  ? Omit<V, K> & { [key in K]?: Date | null }
  : V;
