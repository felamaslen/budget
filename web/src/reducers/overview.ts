import { createReducerObject, Action } from 'create-reducer-object';
import { compose } from '@typed/compose';
import { DateTime } from 'luxon';
import memoize from 'fast-memoize';
import { replaceAtIndex } from 'replace-array';

import { Page, PageListCalc } from '~client/types/app';
import {
  LIST_ITEM_CREATED,
  LIST_ITEM_UPDATED,
  LIST_ITEM_DELETED,
} from '~client/constants/actions/list';
import { getMonthDates } from '~client/selectors/overview/common';
import { ListCalcItem } from './list';

import { DATA_READ } from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';

export type State = {
  startDate: DateTime | null;
  endDate: DateTime | null;
  cost: Partial<
    {
      [page in (PageListCalc | Page.funds | 'fundChanges') | 'balance' | 'old']: number[];
    }
  >;
};

export const initialState = {
  startDate: null,
  endDate: null,
  cost: {},
};

const onRead = (_: State, action: Action): State => ({
  startDate: DateTime.fromObject({
    year: action.res?.overview?.startYearMonth?.[0],
    month: action.res?.overview?.startYearMonth?.[1],
  }).endOf('month'),
  endDate: DateTime.fromObject({
    year: action.res?.overview?.endYearMonth?.[0],
    month: action.res?.overview?.endYearMonth?.[1],
  }).endOf('month'),
  cost: {
    ...action.res?.overview?.cost,
    balance: undefined,
  },
});

const getStateRowDates = memoize((state: State): DateTime[] => getMonthDates({ overview: state }));

const getDateIndex = (state: State, date: DateTime): number =>
  getStateRowDates(state).findIndex(item => date.hasSame(item, 'month'));

function getUpdatedCost(
  state: State,
  page: PageListCalc,
  newItem: Partial<ListCalcItem>,
  oldItem: Partial<ListCalcItem> = { date: newItem.date, cost: 0 },
): Pick<State, 'cost'> {
  if (!(newItem.date && oldItem.date && typeof newItem.cost !== 'undefined')) {
    return state;
  }

  const setCost = (date: DateTime, diff: number) => (last: number[]): number[] =>
    replaceAtIndex(last, getDateIndex(state, date), value => value + diff);

  return {
    cost: {
      ...state.cost,
      [page]: compose(
        setCost(oldItem.date, -(oldItem.cost ?? 0)),
        setCost(newItem.date, +newItem.cost),
      )(state.cost?.[page] ?? []),
    },
  };
}

const onCreate = (state: State, { page, item }: Action): Partial<State> =>
  getUpdatedCost(state, page, item);

const onUpdate = (state: State, { page, item, oldItem }: Action): Partial<State> =>
  getUpdatedCost(state, page, item, oldItem);

const onDelete = (state: State, { page, oldItem }: Action): Partial<State> =>
  getUpdatedCost(state, page, { date: oldItem.date, cost: 0 }, oldItem);

const handlers = {
  [DATA_READ]: onRead,
  [LIST_ITEM_CREATED]: onCreate,
  [LIST_ITEM_UPDATED]: onUpdate,
  [LIST_ITEM_DELETED]: onDelete,
  [LOGGED_OUT]: (): State => initialState,
};

export default createReducerObject<State>(handlers, initialState);
