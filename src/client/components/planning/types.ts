import { Dispatch, SetStateAction } from 'react';
import type { PlanningSyncResponse } from '~client/types/gql';
import type { GQL, OptionalDeep } from '~shared/types';

export type AccountTransaction = {
  key: number | string;
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

export type PlanningMonth = { date: Date; year: number; month: number };

export type State = OptionalDeep<
  GQL<
    Omit<PlanningSyncResponse, 'year' | 'accounts' | 'parameters'> & {
      year: number;
      accounts: NonNullable<Required<PlanningSyncResponse>['accounts']>;
      parameters: NonNullable<Required<PlanningSyncResponse>['parameters']>;
    }
  >,
  'id'
>;

export type PlanningDispatch = Dispatch<SetStateAction<State>>;

export type PlanningContextState = {
  localYear: number;
  state: State;
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
  lastRecordedPaymentMonth: number;
};

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
