import { replaceAtIndex } from 'replace-array';

import {
  AccountRow,
  AccountRowBillsJoins,
  AccountRowCreditCardJoins,
  AccountRowCreditCardPaymentJoins,
  AccountRowIncomeJoins,
  AccountRowValueJoins,
} from '~api/queries/planning';
import type { WithRequiredJoin } from '~api/types';

export const accountRowHasJoins = <
  Joined extends Record<string, unknown>,
  Extra extends Record<string, unknown> = Joined,
  StillNullable extends keyof Joined = never,
  Row extends { id: number } = { id: number }
>(
  idKey: keyof Joined,
) => (
  row: (Row & Joined & Extra) | WithRequiredJoin<Row & Joined & Extra, Joined, StillNullable>,
): row is WithRequiredJoin<Row & Joined & Extra, Joined, StillNullable> => !!row[idKey];

export const accountRowHasIncome = accountRowHasJoins<
  AccountRowIncomeJoins,
  AccountRowIncomeJoins,
  never,
  AccountRow
>('income_id');

export const accountRowHasCreditCardPayment = accountRowHasJoins<
  AccountRowCreditCardJoins & AccountRowCreditCardPaymentJoins
>('credit_card_payment_id');

export const accountRowHasValue = accountRowHasJoins<
  AccountRowValueJoins,
  AccountRowValueJoins,
  'value_value' | 'value_formula' | 'value_transfer_to'
>('value_id');

export const accountRowHasBills = accountRowHasJoins<AccountRowBillsJoins>('bills_date');

export function reduceYearMonthAccumulation<
  T extends { year: number; month: number } & Record<ChildKey, Child>,
  ChildKey extends string,
  Child extends Record<string, number>
>(childKey: ChildKey, accumulator: T[], next: T): T[] {
  if (accumulator.some((compare) => compare.year === next.year && compare.month === next.month)) {
    return replaceAtIndex(
      accumulator,
      accumulator.findIndex(
        (compare) => compare.year === next.year && compare.month === next.month,
      ),
      (prev) => ({
        ...prev,
        [childKey]: Object.entries(next[childKey]).reduce<Child>(
          (last, [key, value]) => ({
            ...last,
            [key]: last[key as keyof Child] + value,
          }),
          prev[childKey],
        ),
      }),
    );
  }

  return [...accumulator, next];
}
