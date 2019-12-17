import { OptimisticStatus } from '~/types/crud';

export type CategoryType = 'asset' | 'liability';

export interface Category {
  id?: string;
  type: CategoryType;
  category: string | null;
  color?: string | null;
}

export interface Subcategory {
  id?: string;
  categoryId: string;
  subcategory: string | null;
  hasCreditLimit: boolean | null;
  opacity: number | null;
}

export type FXValuePart = number | { value: number; currency?: string | null };
export type FXValue = FXValuePart[];
export type EntryValue = number | FXValue;

export const isComplexValue = (value: EntryValue): value is FXValue => Array.isArray(value);
export const isSimpleValue = (value: FXValuePart | EntryValue): value is number =>
  typeof value === 'number';

export type Value = {
  id?: string;
  subcategory: string;
  skip: boolean | null;
  value: EntryValue;
};

export type CreditLimit = {
  subcategory: string;
  limit: number;
};

export type Currency = {
  id?: string;
  currency: string;
  rate: number;
};

export type Entry<D = Date> = {
  id: string;
  date: D;
  values: Value[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};

export type OptimisticCategory = Category & { __optimistic?: OptimisticStatus };
export type OptimisticSubcategory = Subcategory & { __optimistic?: OptimisticStatus };
export type OptimisticEntry = Entry & { __optimistic?: OptimisticStatus };

export type NetWorth = {
  categories: readonly Category[];
  subcategories: readonly Subcategory[];
  entries: readonly Entry[];
};
