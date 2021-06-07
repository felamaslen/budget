import { CompoundLoan } from '~client/selectors';
import type { Line } from '~client/types';
import type { LoanValue, NetWorthValueObject } from '~client/types/gql';

export type LoanWithInfo = {
  loanValue: LoanValue;
  originalLoan: CompoundLoan;
  modifiedLoan: CompoundLoan;
  line: Line;
  originalData?: number[];
  visible: boolean;
};

export type ValueWithRequiredLoan = NetWorthValueObject & { loan: LoanValue };

export type LoanOverride = {
  overpayment: number; // percent
  lumpSum: number;
};

export type LoanOverrides = Record<string, LoanOverride>;
