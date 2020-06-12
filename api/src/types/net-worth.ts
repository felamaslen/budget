import { Create } from './shared';

export type Category = {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  color: string;
  isOption?: boolean;
};

export type CategoryRow = Pick<Category, 'id' | 'type' | 'category' | 'color'> & {
  is_option: Category['isOption'];
};

export type Subcategory = {
  id: string;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  opacity: number;
};

export type SubcategoryRow = Pick<Subcategory, 'id' | 'subcategory' | 'opacity'> & {
  category_id: Subcategory['categoryId'];
  has_credit_limit: Subcategory['hasCreditLimit'];
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

export type ValueObject = {
  id?: string;
  subcategory: Subcategory['id'];
  skip: boolean | null;
  value: Value;
};

export type CreditLimit = {
  subcategory: Subcategory['id'];
  value: number;
};

export type Currency = {
  id?: string;
  currency: string;
  rate: number;
};

export type Entry = {
  id: string;
  date: string;
  values: ValueObject[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
};

export type CreateEntry = Omit<Create<Entry>, 'date' | 'values' | 'currencies'> & {
  date: Date;
  values: Create<ValueObject>[];
  currencies: Create<Currency>[];
};

export type JoinedEntryRow = {
  id: string;
  date: string;

  currency_ids: string[] | [null];
  currencies: string[] | [null];
  currency_rates: number[] | [null];

  credit_limit_subcategory: string[] | [null];
  credit_limit_value: number[] | [null];

  value_id: string;
  value_subcategory: string;
  value_skip: boolean | null;
  value_simple: number | null;

  fx_values: number[] | [null];
  fx_currencies: string[] | [null];

  op_units: number | null;
  op_strike_price: number | null;
  op_market_price: number | null;
};

export type JoinedEntryRowWithCurrencies = JoinedEntryRow & {
  currency_ids: string[];
  currencies: string[];
  currency_rates: number[];
};

export type JoinedEntryRowWithCreditLimit = JoinedEntryRow & {
  credit_limit_subcategory: string[];
  credit_limit_value: number[];
};

export type JoinedEntryRowWithFXValue = JoinedEntryRow & {
  fx_values: number[];
  fx_currencies: string[];
};

export type JoinedEntryRowWithOptionValue = JoinedEntryRow & {
  op_units: number;
  op_strike_price: number;
  op_market_price: number;
};

export type OldNetWorthRow = { value: number; option_value: number };