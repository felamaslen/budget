import { compose } from '@typed/compose';
import { createReducerObject, Action } from 'create-reducer-object';
import addYears from 'date-fns/addYears';
import endOfMonth from 'date-fns/endOfMonth';
import isSameMonth from 'date-fns/isSameMonth';
import setMonth from 'date-fns/setMonth';
import setYear from 'date-fns/setYear';
import memoize from 'fast-memoize';
import { replaceAtIndex } from 'replace-array';

import { ListActionType } from '~client/actions/list';

import { DATA_READ } from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';
import { getMonthDates } from '~client/selectors/overview/common';
import { Page, PageListCalc, ListCalcItem, OverviewState as State } from '~client/types';

export { OverviewState as State } from '~client/types/overview';

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
  getStateRowDates(state).findIndex((item) => isSameMonth(date, item));

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
    replaceAtIndex(last, getDateIndex(state, date), (value) => value + diff);

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

const onCreate = (state: State, { page, delta }: Action): Partial<State> =>
  getUpdatedCost(state, page, delta);

const onUpdate = (state: State, { page, delta, item }: Action): Partial<State> =>
  getUpdatedCost(state, page, delta, item);

const onDelete = (state: State, { page, item }: Action): Partial<State> =>
  getUpdatedCost(state, page, { date: item.date, cost: 0 }, item);

const handlers = {
  [DATA_READ]: onRead,
  [ListActionType.created]: onCreate,
  [ListActionType.updated]: onUpdate,
  [ListActionType.deleted]: onDelete,
  [LOGGED_OUT]: (): State => initialState,
};

export default createReducerObject<State>(handlers, initialState);
