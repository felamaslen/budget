import { createReducerObject, Action } from 'create-reducer-object';
import { compose } from '@typed/compose';
import memoize from 'fast-memoize';
import endOfMonth from 'date-fns/endOfMonth';
import addYears from 'date-fns/addYears';
import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import isSameMonth from 'date-fns/isSameMonth';
import { replaceAtIndex } from 'replace-array';

import { PageListCalc, Page } from '~client/types/app';
import { ListCalcItem } from '~client/types/list';
import { State } from '~client/types/overview';
import {
  LIST_ITEM_CREATED,
  LIST_ITEM_UPDATED,
  LIST_ITEM_DELETED,
} from '~client/constants/actions/list';
import { getMonthDates } from '~client/selectors/overview/common';

import { DATA_READ } from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';

export { State } from '~client/types/overview';

export const initialState: State = {
  startDate: endOfMonth(addYears(new Date(), -1)),
  endDate: endOfMonth(new Date()),
  cost: {
    [Page.funds]: [],
    [Page.income]: [],
    [Page.bills]: [],
    [Page.food]: [],
    [Page.general]: [],
    [Page.holiday]: [],
    [Page.social]: [],
    fundChanges: [],
    old: [],
  },
};

const onRead = (_: State, action: Action): State => ({
  startDate: endOfMonth(
    setMonth(
      setYear(new Date(), action.res?.overview?.startYearMonth?.[0]),
      action.res?.overview?.startYearMonth?.[1] - 1,
    ),
  ),
  endDate: endOfMonth(
    setMonth(
      setYear(new Date(), action.res?.overview?.endYearMonth?.[0]),
      action.res?.overview?.endYearMonth?.[1] - 1,
    ),
  ),
  cost: {
    ...action.res?.overview?.cost,
    balance: undefined,
  },
});

const getStateRowDates = memoize((state: State): Date[] => getMonthDates({ overview: state }));

const getDateIndex = (state: State, date: Date): number =>
  getStateRowDates(state).findIndex(item => isSameMonth(date, item));

function getUpdatedCost(
  state: State,
  page: PageListCalc,
  newItem: Partial<ListCalcItem>,
  oldItem: Partial<ListCalcItem> = { date: newItem.date, cost: 0 },
): Pick<State, 'cost'> {
  if (!(newItem.date && oldItem.date && typeof newItem.cost !== 'undefined')) {
    return state;
  }

  const setCost = (date: Date, diff: number) => (last: number[]): number[] =>
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
