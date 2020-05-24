import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { Period } from '~client/constants/graph';
import { sortByKey } from '~client/modules/data';
import { State } from '~client/reducers';
import * as Funds from '~client/reducers/funds';
import { Page, Fund, WithCrud, RequestType } from '~client/types';

type StateSliced = Pick<State, Page.funds>;

export const getViewSoldFunds = (state: StateSliced): boolean => !!state[Page.funds].viewSoldFunds;

const getNonFilteredFundsRows = (state: StateSliced): WithCrud<Fund>[] => state[Page.funds].items;

export const getFundsRows = createSelector(
  getNonFilteredFundsRows,
  compose(
    (items: WithCrud<Fund>[]): WithCrud<Fund>[] =>
      items.filter(({ __optimistic }) => __optimistic !== RequestType.delete),
    sortByKey('item'),
  ),
);

export const getFundsCache = (state: StateSliced): State[Page.funds]['cache'] =>
  state[Page.funds].cache;
const getFundsPeriod = (state: StateSliced): Period => state[Page.funds].period;

export const getCurrentFundsCache = createSelector(
  [getFundsPeriod, getFundsCache],
  (period, cache): Funds.Cache | undefined => cache && cache[period],
);
