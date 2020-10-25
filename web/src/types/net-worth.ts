import { Create, CrudItem } from './crud';

export type Category = CrudItem<{
  type: 'asset' | 'liability';
  category: string;
  color: string;
  isOption: boolean;
}>;

export type Subcategory = CrudItem<{
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
}>;

export type FXValue = {
  value: number;
  currency: string;
};

export type OptionValue = {
  units: number;
  vested: number;
  strikePrice: number;
  marketPrice: number;
};

export type ComplexValueItem = number | FXValue | OptionValue;
export type ComplexValue = ComplexValueItem[];

export type MortgageValue = {
  principal: number;
  paymentsRemaining: number;
  rate: number;
};

export type Value = number | ComplexValue | MortgageValue;

export const isMortgageValue = (value: Value): value is MortgageValue =>
  typeof value === 'object' && Reflect.has(value, 'principal');
export const isComplex = (value: Value): value is ComplexValue => Array.isArray(value);
export const isFX = (value: ComplexValueItem): value is FXValue =>
  typeof value === 'object' && Reflect.has(value, 'currency');
export const isOption = (value: ComplexValueItem): value is OptionValue =>
  typeof value === 'object' && Reflect.has(value, 'strikePrice');

export type ValueObject = CrudItem<{
  subcategory: Subcategory['id'];
  skip?: boolean | null;
  value: Value;
}>;

export type CreditLimit = {
  subcategory: Subcategory['id'];
  value: number;
};

export type Currency = CrudItem<{
  currency: string;
  rate: number;
}>;

export type Entry = CrudItem<{
  date: Date;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
}>;

export type CreateEntry = Omit<Entry, 'values' | 'currencies'> & {
  values: Create<ValueObject>[];
  currencies: Create<Currency>[];
};

export type NetWorthTableRow = CrudItem<{
  date: Date;
  assets: number;
  options: number;
  liabilities: number;
  aggregate: AggregateSums;
  expenses: number;
  fti: number;
  pastYearAverageSpend: number;
}>;

export type NetWorthTableColumn = 'date' | 'assets' | 'liabilities' | 'main' | 'expenses';

export enum Aggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks',
  pension = 'Pension',
  realEstate = 'House',
  mortgage = 'Mortgage',
}

export type AggregateSums = {
  [key in Aggregate]: number;
};
