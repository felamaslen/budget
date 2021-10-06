import isSameMonth from 'date-fns/isSameMonth';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import type { State } from '../types';

import type { NetWorthEntryNative } from '~client/types';
import { coalesceKeys, omitDeep } from '~shared/utils';

const getCompareState = (state: State): State => ({
  parameters: state.parameters,
  accounts: state.accounts.map<State['accounts'][0]>((account) => ({
    ...omitDeep(account, 'id'),
    values: account.values.map((row) =>
      coalesceKeys(omit(row, 'id'), 'value', 'formula', 'transferToAccountId'),
    ),
  })),
});

export const isStateEqual = (s0: State, s1: State): boolean =>
  isEqual(getCompareState(s0), getCompareState(s1));

export function filterNetWorthByMonth(
  entries: NetWorthEntryNative[],
  date: Date,
): NetWorthEntryNative | undefined {
  return entries.find((entry) => isSameMonth(entry.date, date));
}
