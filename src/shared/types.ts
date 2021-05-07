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
