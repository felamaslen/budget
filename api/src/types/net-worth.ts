import { Create } from './shared';

export type Category = {
  id: number;
  type: 'asset' | 'liability';
  category: string;
  color: string;
  isOption?: boolean;
};

export type CategoryRow = Pick<Category, 'id' | 'type' | 'category' | 'color'> & {
  is_option: Category['isOption'];
};

export type Subcategory = {
  id: number;
  categoryId: Category['id'];
  subcategory: string;
  hasCreditLimit: boolean | null;
  isSAYE: boolean | null;
  opacity: number;
};

export type SubcategoryRow = Pick<Subcategory, 'id' | 'subcategory' | 'opacity'> & {
  category_id: Subcategory['categoryId'];
  has_credit_limit: Subcategory['hasCreditLimit'];
  is_saye: Subcategory['isSAYE'];
};

export type FXValue = {
  value: number;
  currency: string;
};

export type OptionValue = {
  units: number;
  strikePrice: number;
  marketPrice: number;
  vested: number;
};

export type MortgageValue = {
  principal: number;
  paymentsRemaining: number;
  rate: number;
};

export type ComplexValueItem = number | FXValue | OptionValue;
export type ComplexValue = ComplexValueItem[];

export type Value = number | ComplexValue | MortgageValue;

export type ValueObject = {
  id?: number;
  subcategory: Subcategory['id'];
  skip: boolean | null;
  value: Value;
};

export type CreditLimit = {
  subcategory: Subcategory['id'];
  value: number;
};

export type Currency = {
  id?: number;
  currency: string;
  rate: number;
};

export type Entry = {
  id: number;
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
  id: number;
  date: string;

  currency_ids: number[] | [null];
  currencies: string[] | [null];
  currency_rates: number[] | [null];

  credit_limit_subcategory: number[] | [null];
  credit_limit_value: number[] | [null];

  value_id: number;
  value_subcategory: number;
  value_skip: boolean | null;
  value_simple: number | null;

  fx_values: number[] | [null];
  fx_currencies: string[] | [null];

  op_units: number | null;
  op_strike_price: number | null;
  op_market_price: number | null;
  op_vested: number | null;

  mortgage_payments_remaining: number | null;
  mortgage_rate: number | null;
};

export type JoinedEntryRowWithCurrencies = JoinedEntryRow & {
  currency_ids: number[];
  currencies: string[];
  currency_rates: number[];
};

export type JoinedEntryRowWithCreditLimit = JoinedEntryRow & {
  credit_limit_subcategory: number[];
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
  op_vested: number;
};

export type JoinedEntryRowWithMortgageValue = JoinedEntryRow & {
  mortgage_payments_remaining: number;
  mortgage_rate: number;
};

export type OldNetWorthRow = { value: number; option_value: number };
export type OldHomeEquityRow = { date: string; home_equity: number };
