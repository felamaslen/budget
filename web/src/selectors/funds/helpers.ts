import { createSelector } from 'reselect';
import { compose } from '@typed/compose';

import { State } from '~client/reducers';
import * as Funds from '~client/reducers/funds';
import { LegacyRow } from '~client/types/funds';
import { WithCrud } from '~client/types/crud';
import { sortByKey } from '~client/modules/data';
import { DELETE } from '~client/constants/data';
import { Period } from '~client/constants/graph';

type StateSliced = Pick<State, 'funds'>;

export const getViewSoldFunds = (state: StateSliced): boolean => !!state.funds.viewSoldFunds;

const getNonFilteredFundsRows = (state: StateSliced): WithCrud<LegacyRow>[] => state.funds.items;

export const getFundsRows = createSelector(
  getNonFilteredFundsRows,
  compose(
    (items: WithCrud<LegacyRow>[]): WithCrud<LegacyRow>[] =>
      items.filter(({ __optimistic }) => __optimistic !== DELETE),
    sortByKey('item'),
  ),
);

export const getFundsCache = (state: StateSliced): State['funds']['cache'] => state.funds.cache;
const getFundsPeriod = (state: StateSliced): Period => state.funds.period;

export const getCurrentFundsCache = createSelector(
  [getFundsPeriod, getFundsCache],
  (period, cache): Funds.Cache | undefined => cache && cache[period],
);
