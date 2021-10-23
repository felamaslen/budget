import type {
  AccountRow,
  AccountRowBillsJoins,
  AccountRowCreditCardJoins,
  AccountRowCreditCardPaymentJoins,
  AccountRowValueJoins,
  AverageCreditCardPaymentRow,
  LatestPlanningAccountValueRow,
  ParameterRow,
  PreviousIncomeRow,
} from '~api/queries/planning';
import type { WithRequiredJoin } from '~api/types';

export type CalculationRows = {
  accountsWithIncome: Record<number, readonly AccountRow[]>;
  thresholdRows: readonly ParameterRow[];
  rateRows: readonly ParameterRow[];
  valueRows: readonly WithRequiredJoin<
    { id: number } & AccountRowValueJoins,
    AccountRowValueJoins,
    'value_value' | 'value_formula' | 'value_transfer_to'
  >[];
  billsRows: readonly WithRequiredJoin<
    { id: number } & AccountRowBillsJoins,
    AccountRowBillsJoins
  >[];
  latestActualValues: readonly LatestPlanningAccountValueRow[];
  previousIncome: readonly PreviousIncomeRow[];
  creditCards: readonly WithRequiredJoin<
    { id: number } & AccountRowCreditCardJoins & AccountRowCreditCardPaymentJoins,
    AccountRowCreditCardJoins
  >[];
  averageCreditCardPaymentRows: readonly AverageCreditCardPaymentRow[];
};
