import isSameMonth from 'date-fns/isSameMonth';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import type { State } from '../types';

import type { NetWorthEntryNative } from '~client/types';
import { coalesceKeys, omitDeep } from '~shared/utils';

const getCompareState = (state: State): Record<string, unknown> => ({
  parameters: state.parameters,
  accounts: state.accounts.map((account) =>
    omitDeep(
      {
        ...omit(account, 'computedValues'),
        creditCards: account.creditCards.map((card) => omit(card, 'predictedPayment')),
        values: account.values.map((row) =>
          coalesceKeys(row, 'value', 'formula', 'transferToAccountId'),
        ),
      },
      'id',
    ),
  ),
});

export const isStateEqual = (s0: State, s1: State): boolean =>
  isEqual(getCompareState(s0), getCompareState(s1));

export function filterNetWorthByMonth(
  entries: NetWorthEntryNative[],
  date: Date,
): NetWorthEntryNative | undefined {
  return entries.find((entry) => isSameMonth(entry.date, date));
}
