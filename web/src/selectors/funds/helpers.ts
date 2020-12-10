import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { sortByKey } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { withoutDeleted } from '~client/selectors/crud';
import { FundNative as Fund, PageNonStandard } from '~client/types';

type StateSliced = Pick<State, PageNonStandard.Funds>;
export type PriceCache = Pick<State[PageNonStandard.Funds], 'startTime' | 'cacheTimes' | 'prices'>;

export const getViewSoldFunds = (state: StateSliced): boolean =>
  !!state[PageNonStandard.Funds].viewSoldFunds;

const getNonFilteredFundsRows = (state: StateSliced): CrudState<Fund> =>
  state[PageNonStandard.Funds];

export const getFundsRows = createSelector<State, CrudState<Fund>, Fund[]>(
  getNonFilteredFundsRows,
  compose(sortByKey('item'), withoutDeleted),
);

export const getFundsCache = (state: StateSliced): PriceCache => ({
  startTime: state.funds.startTime,
  cacheTimes: state.funds.cacheTimes,
  prices: state.funds.prices,
});
