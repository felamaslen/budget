export type IncludeOne<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]?: T[P];
} &
  {
    [P in Extract<keyof T, K>]: T[P];
  };

export type OptionalKeys<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
} &
  {
    [P in Extract<keyof T, K>]?: T[P];
  };

export type ExcludeOne<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};
