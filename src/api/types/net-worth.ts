import { NetWorthCategory, NetWorthSubcategory } from './gql';

export type CategoryRow = Omit<NetWorthCategory, 'isOption'> & {
  is_option: NetWorthCategory['isOption'];
};

export type SubcategoryRow = Omit<
  NetWorthSubcategory,
  'categoryId' | 'hasCreditLimit' | 'isSAYE'
> & {
  category_id: NetWorthSubcategory['categoryId'];
  has_credit_limit: NetWorthSubcategory['hasCreditLimit'];
  is_saye: NetWorthSubcategory['isSAYE'];
};

export type ValueRow = [number, boolean | null, number, number | null];
export type FXValueRow = [number, number, string];
export type OptionValueRow = [number, number, number, number, number];
export type MortgageValueRow = [number, number, number];

export type JoinedEntryRow = {
  id: number;
  date: string;
  is_saye: boolean | null;

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
  value_simple: number;
  mortgage_payments_remaining: number;
  mortgage_rate: number;
};

export type OldNetWorthRow = { value: number; option_value: number };
export type OldHomeEquityRow = { date: string; home_equity: number };
