import { createSelector } from 'reselect';
import { compose } from '@typed/compose';

import { IncludeOne } from '~/types/utils';
import { OptimisticStatus } from '~/types/crud';
import { Fund } from '~/types/funds';
import { GlobalState } from '~/reducers';
import { sortByKey } from '~/modules/array';
import { withoutDeleted } from '~/modules/crud';

type State = IncludeOne<GlobalState, 'funds'>;

type OptimisticFund = Fund & { __optimistic?: OptimisticStatus };

const getNonFilteredFundsRows = (state: State): OptimisticFund[] => state.funds.items;

export const getFundsRows = createSelector<State, OptimisticFund[], OptimisticFund[]>(
  getNonFilteredFundsRows,
  compose<OptimisticFund[], OptimisticFund[], OptimisticFund[]>(
    sortByKey<OptimisticFund>('item'),
    withoutDeleted,
  ),
);
