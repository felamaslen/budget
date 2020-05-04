export type PickUnion<T extends object, K extends keyof T> = { [P in K]: T[P] };

export type PickRequire<T extends object, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type IdMap<V> = {
  [id: string]: V;
};
