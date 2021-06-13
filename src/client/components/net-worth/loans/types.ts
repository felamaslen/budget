import type { CompoundLoan } from '~client/selectors';
import type { Line } from '~client/types';
import type { LoanValue, NetWorthLoan, NetWorthLoanValue } from '~client/types/gql';
import type { NativeDate } from '~shared/types';

export type LoanWithInfo = {
  loanValue: LoanValue;
  originalLoan: CompoundLoan;
  modifiedLoan: CompoundLoan;
  minMonthlyPayment: number;
  line: Line;
  originalData?: number[];
  visible: boolean;
};

export type NetWorthLoanNative = Omit<NetWorthLoan, 'values'> & {
  values: NativeDate<NetWorthLoanValue, 'date'>[];
};

export type LoanOverride = {
  overpayment: number; // percent
  lumpSum: number;
};

export type LoanOverrides = Record<string, LoanOverride>;
