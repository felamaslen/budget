export type ParameterRow = {
  readonly id: number;
  uid: number;
  year: number;
  name: string;
  value: number;
};

export type ThresholdRow = ParameterRow;
export type RateRow = ParameterRow; // value is a float instead of int, but JS doesn't know the difference

export type AccountRow = {
  readonly id: number;
  uid: number;
  account: string;
  net_worth_subcategory_id: number;
  limit_upper: number | null;
  limit_lower: number | null;
  include_bills: boolean | null;
};

export type PlanningIncomeRow = {
  id: number;
  account_id: number;
  start_date: string | Date;
  end_date: string | Date;
  salary: number;
  tax_code: string;
  pension_contrib: number;
  student_loan: boolean;
};

export type PlanningCreditCardRow = {
  readonly id: number;
  account_id: number;
  net_worth_subcategory_id: number;
};

export type PlanningCreditCardPaymentRow = {
  readonly id: number;
  credit_card_id: number;
  year: number;
  month: number;
  value: number;
};

export type PlanningValueRow = {
  readonly id: number;
  year: number;
  month: number;
  account_id: number;
  name: string;
  value: number | null;
  formula: string | null;
  transfer_to: number | null;
};

export type AccountRowIncomeJoins = {
  income_id: number | null;
  income_start_date: string | Date | null;
  income_end_date: string | Date | null;
  income_salary: number | null;
  income_tax_code: string | null;
  income_pension_contrib: number | null;
  income_student_loan: boolean | null;
};

export type AccountRowBillsJoins = {
  bills_date: Date | null;
  bills_sum: number | null;
};

export type AccountRowCreditCardJoins = {
  credit_card_id: number | null;
  credit_card_net_worth_subcategory_id: number | null;
};

export type AccountRowCreditCardPaymentJoins = {
  credit_card_payment_id: number | null;
  credit_card_payment_year: number | null;
  credit_card_payment_month: number | null;
  credit_card_payment_value: number | null;
};

export type AccountRowValueJoins = {
  value_id: number | null;
  value_name: string | null;
  value_year: number | null;
  value_month: number | null;
  value_value: number | null;
  value_formula: string | null;
  value_transfer_to: number | null;
};

export type LatestPlanningAccountValueRow = {
  account_id: number;
  date: Date;
  value: number;
};

export type PreviousIncomeRow = {
  id: number;
  date: Date;
  year: number;
  month: number;
  item: string;
  gross: number;
  deduction_name: string | null;
  deduction_value: number | null;
};

export type PreviousIncomeDeductionRow = {
  deduction_name: string;
  deduction_value: number;
};

export type PreviousIncomeRowWithDeduction = Omit<
  PreviousIncomeRow,
  keyof PreviousIncomeDeductionRow
> &
  PreviousIncomeDeductionRow;

export type AverageCreditCardPaymentRow = {
  credit_card_id: number;
  value: number;
};
