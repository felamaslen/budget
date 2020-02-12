export type PickUnion<T extends object, K extends keyof T> = { [P in K]: T[P] };
