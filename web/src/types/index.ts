export * from './analysis';
export * from './api';
export * from './app';
export * from './auth';
export * from './crud';
export * from './funds';
export * from './graph';
export * from './list';
export * from './net-worth';
export * from './overview';

export type PickUnion<T extends object, K extends keyof T> = { [P in K]: T[P] };

export type PickRequire<T extends object, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type IdMap<V> = {
  [id: string]: V;
};
