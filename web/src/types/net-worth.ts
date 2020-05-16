import { Create, WithCrud, RawDate, Request } from './crud';

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

export type ComplexValueItem = number | FXValue | OptionValue;
export type ComplexValue = ComplexValueItem[];

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
  id?: string; // only present on response, not used in web app
  subcategory: Subcategory['id'];
  value: number;
};

export type Entry = {
  id: string;
  date: Date;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};

export type EntryWithOptionalIds = Omit<Entry, 'values' | 'creditLimit' | 'currencies'> & {
  values: Create<ValueObject>[];
  creditLimit: Create<CreditLimit>[];
  currencies: Create<Currency>[];
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

export type NetWorthRequest<I extends WithCrud<{ id: string }> = never> = Request & {
  res: I;
};

export type RequestItem = Category | Subcategory | RawDate<EntryWithOptionalIds>;
export type NetWorthRequestGeneric = NetWorthRequest<RequestItem>;

export type TableRow = {
  id: string;
  date: Date;
  assets: number;
  liabilities: number;
  expenses: number;
  fti: number;
  pastYearAverageSpend: number;
};

export enum Aggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks',
  pension = 'Pension',
}

export type AggregateSums = {
  [key in Aggregate]: number;
};
