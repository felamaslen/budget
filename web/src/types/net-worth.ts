import { DateTime } from 'luxon';

export type Category = {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  color: string;
};

export type Subcategory = {
  id: string;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
};

type FXValue = {
  value: number;
  currency: string;
};

type ComplexValueItem = number | FXValue;
type ComplexValue = ComplexValueItem[];

export type Value = number | ComplexValue;

export const isComplex = (value: Value): value is ComplexValue => Array.isArray(value);
export const isFX = (value: ComplexValueItem): value is FXValue =>
  typeof value === 'object' && Reflect.has(value, 'currency');

export type ValueObject = {
  id: string;
  subcategory: Subcategory['id'];
  skip?: boolean | null;
  value: Value;
};

export type CreditLimit = {
  subcategory: Subcategory['id'];
  value: number;
};

export type Entry = {
  id: string;
  date: Date | DateTime;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};

export type Currency = {
  id: string;
  currency: string;
  rate: number;
};

export type Item = Pick<Entry, 'id' | 'date' | 'values' | 'creditLimit'> & {
  spend: number;
  fti: () => number;
};
