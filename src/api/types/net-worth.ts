import { NetWorthCategory, NetWorthSubcategory } from './gql';

export type CategoryRow = Omit<NetWorthCategory, 'isOption'> & {
  is_option: NetWorthCategory['isOption'];
};

export type SubcategoryRow = Omit<
  NetWorthSubcategory,
  'categoryId' | 'appreciationRate' | 'hasCreditLimit' | 'isSAYE'
> & {
  category_id: NetWorthSubcategory['categoryId'];
  appreciation_rate: NetWorthSubcategory['appreciationRate'];
  has_credit_limit: NetWorthSubcategory['hasCreditLimit'];
  is_saye: NetWorthSubcategory['isSAYE'];
};

export type NetWorthEntryRow = {
  id: number;
  date: string;
};

export type ValueRowSelect = {
  id: number;
  subcategory: number;
  net_worth_id: number;
  value: number | null;
};

export type ValueRow = [number, boolean | null, number, number | null];
export type FXValueRow = [number, number, string];
export type OptionValueRow = [number, number, number, number, number];
export type LoanValueRow = [number, number, number];

export type JoinedEntryRow = NetWorthEntryRow & {
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

  loan_payments_remaining: number | null;
  loan_rate: number | null;
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

export type JoinedEntryRowWithLoanValue = JoinedEntryRow & {
  value_simple: number;
  loan_payments_remaining: number;
  loan_rate: number;
};

export type OldNetWorthRow = {
  date: Date;
  assets: number;
  liabilities: number;
  pension: number;
  options: number;
  illiquid_equity: number;
  liquid_cash: number;
  locked_cash: number;
  investments: number;
};
