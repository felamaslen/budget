export type PickPartial<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AsyncReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => Promise<infer U>
  ? U
  : unknown;

export const enum Page {
  overview = 'overview',
  analysis = 'analysis',
  funds = 'funds',
  income = 'income',
  bills = 'bills',
  food = 'food',
  general = 'general',
  holiday = 'holiday',
  social = 'social',
}

export type ListCategory =
  | Page.funds
  | Page.income
  | Page.bills
  | Page.food
  | Page.general
  | Page.holiday
  | Page.social;

export type ListCalcCategory = Exclude<ListCategory, Page.funds>;
export type ListCalcCategoryExtended = Exclude<ListCalcCategory, Page.income | Page.bills>;

export interface Item {
  id: number;
}

export type Create<V> = Omit<V, 'id'>;
export type Update<V> = Create<V> & Item;

export type RawDate<V> = V extends { date: Date } ? Omit<V, 'date'> & { date: string } : V;
