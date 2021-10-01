import type { PlanningSyncResponse } from '~client/types/gql';
import type { GQL, OptionalDeep } from '~shared/types';

export type AccountTransaction = {
  id: number | string;
  name: string;
  computedValue: number | undefined;
  value?: number;
  formula?: string;
  isVerified?: boolean;
  isComputed?: boolean;
};

export type AccountCreditCardPayment = {
  netWorthSubcategoryId: number;
  name: string;
  value: number | undefined;
  isVerified?: boolean;
};

export type IncomeRates = {
  taxBasicRate: number;
  taxHigherRate: number;
  taxAdditionalRate: number;
  taxBasicAllowance: number;
  taxAdditionalThreshold: number;
  niPaymentThreshold: number;
  niUpperEarningsLimit: number;
  niLowerRate: number;
  niHigherRate: number;
  studentLoanRate: number;
  studentLoanThreshold: number;
};

export type PlanningMonth = { date: Date; year: number; month: number };

export type State = OptionalDeep<
  GQL<{
    accounts: NonNullable<Required<PlanningSyncResponse>['accounts']>;
    parameters: NonNullable<Required<PlanningSyncResponse>['parameters']>;
  }>,
  'id'
>;

export type Account = State['accounts'][0];
export type AccountIncome = Account['income'][0];
export type AccountCredit = Account['creditCards'][0];

export type MonthByAccount = {
  accountGroup: Account;
  startValue: AccountTransaction;
  transactions: AccountTransaction[];
  creditCards: AccountCreditCardPayment[];
  endValue: AccountTransaction;
};

export type PlanningData = PlanningMonth & {
  accounts: MonthByAccount[];
  numRows: number;
  isCurrentMonth: boolean;
};
