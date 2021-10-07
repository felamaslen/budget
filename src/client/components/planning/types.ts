import { Dispatch, SetStateAction } from 'react';
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
  isTransfer?: boolean;
  color?: string;
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

export type PlanningDispatch = Dispatch<SetStateAction<State>>;

export type PlanningContextState = {
  state: State;
  year: number;
  isSynced: boolean;
  isLoading: boolean;
  error: string | null;
  table: PlanningData[];
};

export type Account = State['accounts'][0];
export type AccountIncome = Account['income'][0];
export type AccountCredit = Account['creditCards'][0];

export type CreditCardRecord = {
  netWorthSubcategoryId: number;
  name: string;
  lastRecordedPayment: PlanningMonth;
  averageRecordedPayment: number | undefined;
};

export type MonthByAccount = {
  accountGroup: Account;
  startValue: AccountTransaction;
  transactions: AccountTransaction[];
  taxRelief: number;
  previousYearTaxRelief: number;
  creditCards: AccountCreditCardPayment[];
  endValue: AccountTransaction;
};

export type PlanningData = PlanningMonth & {
  accounts: MonthByAccount[];
  numRows: number;
  isCurrentMonth: boolean;
};
