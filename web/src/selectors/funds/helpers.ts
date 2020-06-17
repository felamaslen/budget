import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { Period } from '~client/constants/graph';
import { sortByKey } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { Cache } from '~client/reducers/funds';
import { withoutDeleted } from '~client/selectors/crud';
import { Page, Fund } from '~client/types';

type StateSliced = Pick<State, Page.funds>;

export const getViewSoldFunds = (state: StateSliced): boolean => !!state[Page.funds].viewSoldFunds;

const getNonFilteredFundsRows = (state: StateSliced): CrudState<Fund> => state[Page.funds];

export const getFundsRows = createSelector<State, CrudState<Fund>, Fund[]>(
  getNonFilteredFundsRows,
  compose(sortByKey('item'), withoutDeleted),
);

export const getFundsCache = (state: StateSliced): State[Page.funds]['cache'] =>
  state[Page.funds].cache;
const getFundsPeriod = (state: StateSliced): Period => state[Page.funds].period;

export const getCurrentFundsCache = createSelector(
  [getFundsPeriod, getFundsCache],
  (period, cache): Cache | undefined => cache && cache[period],
);
