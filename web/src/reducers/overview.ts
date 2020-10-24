import { compose } from '@typed/compose';
import addYears from 'date-fns/addYears';
import endOfMonth from 'date-fns/endOfMonth';
import isSameMonth from 'date-fns/isSameMonth';
import setMonth from 'date-fns/setMonth';
import setYear from 'date-fns/setYear';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';

import {
  Action,
  ActionTypeApi,
  ActionTypeLogin,
  ListActionType,
  ListItemCreated,
  ListItemUpdated,
  ListItemDeleted,
  isCalcListAction,
  ActionTypeFunds,
  isGeneralListAction,
} from '~client/actions';
import { IGNORE_EXPENSE_CATEGORIES } from '~client/constants/data';
import { getMonthDates } from '~client/selectors/overview/common';
import { Page, PageList, ListCalcItem, OverviewState as State, ReadResponse } from '~client/types';

export { State };

export const initialState: State = {
  startDate: endOfMonth(addYears(new Date(), -1)),
  endDate: endOfMonth(new Date()),
  annualisedFundReturns: 0.1,
  homeEquityOld: [],
  cost: {
    [Page.funds]: [],
    [Page.income]: [],
    [Page.bills]: [],
    [Page.food]: [],
    [Page.general]: [],
    [Page.holiday]: [],
    [Page.social]: [],
  },
};

const onRead = (_: State, res: ReadResponse): State => ({
  startDate: endOfMonth(
    setMonth(
      setYear(new Date(), res.overview.startYearMonth[0]),
      res.overview.startYearMonth[1] - 1,
    ),
  ),
  endDate: endOfMonth(
    setMonth(setYear(new Date(), res.overview.endYearMonth[0]), res.overview.endYearMonth[1] - 1),
  ),
  annualisedFundReturns: res.overview.annualisedFundReturns,
  homeEquityOld: res.overview.homeEquityOld,
  cost: res.overview.cost,
});

const getStateRowDates = moize((state: State): Date[] => getMonthDates({ overview: state }));

const getDateIndex = (state: State, date: Date): number =>
  getStateRowDates(state).findIndex((item) => isSameMonth(date, item));

const setCost = (state: State, date: Date, diff: number) => (last: number[]): number[] =>
  replaceAtIndex(last, getDateIndex(state, date), (value) => value + diff);

const onCreate = (state: State, action: ListItemCreated<ListCalcItem, PageList>): State =>
  isGeneralListAction(action) && IGNORE_EXPENSE_CATEGORIES.includes(action.delta.category)
    ? state
    : {
        ...state,
        cost: {
          ...state.cost,
          [action.page]: setCost(
            state,
            action.delta.date,
            action.delta.cost,
          )(state.cost[action.page]),
        },
      };

const onUpdate = (state: State, action: ListItemUpdated<ListCalcItem, PageList>): State => ({
  ...state,
  cost: {
    ...state.cost,
    [action.page]: compose(
      setCost(
        state,
        action.delta.date ?? action.item.date,
        isGeneralListAction(action) &&
          action.delta.category &&
          IGNORE_EXPENSE_CATEGORIES.includes(action.delta.category)
          ? 0
          : action.delta.cost ?? action.item.cost,
      ),
      setCost(
        state,
        action.item.date,
        isGeneralListAction(action) && IGNORE_EXPENSE_CATEGORIES.includes(action.item.category)
          ? 0
          : -action.item.cost,
      ),
    )(state.cost[action.page]),
  },
});

const onDelete = (state: State, action: ListItemDeleted<ListCalcItem, PageList>): State =>
  isGeneralListAction(action) && IGNORE_EXPENSE_CATEGORIES.includes(action.item.category)
    ? state
    : {
        ...state,
        cost: {
          ...state.cost,
          [action.page]: setCost(
            state,
            action.item.date,
            -action.item.cost,
          )(state.cost[action.page]),
        },
      };

export default function overview(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.DataRead:
      return action.res ? onRead(state, action.res) : state;

    case ListActionType.Created:
      return isCalcListAction(action) ? onCreate(state, action) : state;
    case ListActionType.Updated:
      return isCalcListAction(action) ? onUpdate(state, action) : state;
    case ListActionType.Deleted:
      return isCalcListAction(action) ? onDelete(state, action) : state;

    case ActionTypeFunds.Received:
      return {
        ...state,
        annualisedFundReturns:
          action.res?.data.annualisedFundReturns ?? state.annualisedFundReturns,
      };

    case ActionTypeLogin.LoggedOut:
    default:
      return state;
  }
}
