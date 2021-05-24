import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { sortByKey } from '~client/modules/data';
import type { State } from '~client/reducers/types';
import type { CashTotalNative, NetWorthEntryNative, PageNonStandard } from '~client/types';
import type { Monthly, NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';

export const getCashTotal = (state: State): CashTotalNative => state.netWorth.cashTotal;

export const getMonthlyValues = (state: State): Monthly => state.overview.monthly;
export const getStockValues = (state: State): number[] => state.overview.stocks;

export const getStartDate = (state: Pick<State, PageNonStandard.Overview>): Date =>
  state.overview.startDate;

export const getEndDate = (state: Pick<State, PageNonStandard.Overview>): Date =>
  state.overview.endDate;

export const getAnnualisedFundReturns = (state: State): number =>
  state.overview.annualisedFundReturns;

export const getEntries = (state: State): NetWorthEntryNative[] => state.netWorth.entries;

const getNonFilteredCategories = (state: State): NetWorthCategory[] => state.netWorth.categories;
const getNonFilteredSubcategories = (state: State): NetWorthSubcategory[] =>
  state.netWorth.subcategories;

export const getCategories = createSelector(
  getNonFilteredCategories,
  sortByKey('type', 'category'),
);
export const getSubcategories = createSelector(
  getNonFilteredSubcategories,
  compose<NetWorthSubcategory[], NetWorthSubcategory[], NetWorthSubcategory[]>(
    sortByKey('subcategory'),
    sortByKey('categoryId'),
  ),
);
