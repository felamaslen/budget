import { Create } from './crud';

export type Category = {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  color: string;
  isOption: boolean;
};

export type Subcategory = {
  id: string;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
};

export type FXValue = {
  value: number;
  currency: string;
};

export type OptionValue = {
  units: number;
  strikePrice: number;
  marketPrice: number;
};

type ComplexValueItem = number | FXValue | OptionValue;
type ComplexValue = ComplexValueItem[];

export type Value = number | ComplexValue;

export const isComplex = (value: Value): value is ComplexValue => Array.isArray(value);
export const isFX = (value: ComplexValueItem): value is FXValue =>
  typeof value === 'object' && Reflect.has(value, 'currency');
export const isOption = (value: ComplexValueItem): value is OptionValue =>
  typeof value === 'object' && Reflect.has(value, 'strikePrice');

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

export type Currency = {
  id: string;
  currency: string;
  rate: number;
};

export type Entry = {
  id: string;
  date: Date;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};

export type CreateEntry = Omit<Entry, 'values' | 'currencies'> & {
  values: Create<ValueObject>[];
  currencies: Create<Currency>[];
};

export type NetWorthTableRow = {
  id: string;
  date: Date;
  assets: number;
  options: number;
  liabilities: number;
  aggregate: AggregateSums;
  expenses: number;
  fti: number;
  pastYearAverageSpend: number;
};

export type NetWorthTableColumn = 'date' | 'assets' | 'liabilities' | 'main' | 'expenses';

export enum Aggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks',
  pension = 'Pension',
}

export type AggregateSums = {
  [key in Aggregate]: number;
};
