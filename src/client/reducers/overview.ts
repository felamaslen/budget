import { compose } from '@typed/compose';
import addYears from 'date-fns/addYears';
import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';

import {
  isStandardListAction,
  Action,
  ActionTypeApi,
  ActionTypeLogin,
  ListActionType,
  ListItemCreated,
  ListItemUpdated,
  ListItemDeleted,
  ActionTypeFunds,
  FundPricesUpdated,
  ActionReceiptCreated,
} from '~client/actions';
import { getMonthDatesList } from '~client/modules/date';
import type { StandardInput } from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { InitialQuery } from '~client/types/gql';
import { investmentPurchaseCategories } from '~shared/constants';
import type { GQL, NativeDate } from '~shared/types';

export type State = NativeDate<
  GQL<Exclude<InitialQuery['overview'], null | undefined>>,
  'startDate' | 'endDate'
> & { annualisedFundReturns: number; stocks: number[] };

export const initialState: State = {
  startDate: endOfMonth(addYears(new Date(), -1)),
  endDate: endOfMonth(new Date()),
  annualisedFundReturns: 0,
  monthly: {
    investmentPurchases: [],
    [PageListStandard.Income]: [],
    [PageListStandard.Bills]: [],
    [PageListStandard.Food]: [],
    [PageListStandard.General]: [],
    [PageListStandard.Holiday]: [],
    [PageListStandard.Social]: [],
  },
  futureIncome: [],
  stocks: [],
  initialCumulativeValues: {
    income: 0,
    spending: 0,
  },
};

const onRead = (state: State, res: InitialQuery): State => ({
  ...state,
  startDate: res.overview ? endOfDay(new Date(res.overview?.startDate)) : state.startDate,
  endDate: res.overview ? endOfDay(new Date(res.overview?.endDate)) : state.endDate,
  monthly: res.overview?.monthly ?? state.monthly,
  futureIncome: res.overview?.futureIncome ?? state.futureIncome,
  annualisedFundReturns: res.fundHistory?.annualisedFundReturns ?? state.annualisedFundReturns,
  stocks: res.fundHistory?.overviewCost ?? state.stocks,
  initialCumulativeValues: res.overview?.initialCumulativeValues ?? state.initialCumulativeValues,
});

const getStateRowDates = moize(
  ({ startDate, endDate }: State): Date[] => getMonthDatesList(startDate, endDate),
  { maxSize: 1 },
);

const getDateIndex = (state: State, date: Date): number =>
  getStateRowDates(state).findIndex((item) => isSameMonth(date, item));

const setCost =
  (state: State, date: Date, diff: number) =>
  (last: number[]): number[] =>
    replaceAtIndex(last, getDateIndex(state, date), (value) => value + diff);

const withInvestments =
  (delta: Partial<StandardInput> | null, item?: StandardInput | null) =>
  (state: State): State => ({
    ...state,
    monthly: {
      ...state.monthly,
      investmentPurchases: compose(
        setCost(
          state,
          delta?.date ?? item?.date ?? new Date(),
          delta?.category && investmentPurchaseCategories.includes(delta.category)
            ? delta.cost ?? item?.cost ?? 0
            : 0,
        ),
        setCost(
          state,
          item?.date ?? new Date(),
          item?.category && investmentPurchaseCategories.includes(item.category)
            ? -(item?.cost ?? 0)
            : 0,
        ),
      )(state.monthly.investmentPurchases),
    },
  });

const onCreate = (state: State, action: ListItemCreated<StandardInput, PageListStandard>): State =>
  withInvestments(action.delta)(
    action.delta.category && investmentPurchaseCategories.includes(action.delta.category)
      ? state
      : {
          ...state,
          monthly: {
            ...state.monthly,
            [action.page]: setCost(
              state,
              action.delta.date,
              action.delta.cost,
            )(state.monthly[action.page]),
          },
        },
  );

const onUpdate = (state: State, action: ListItemUpdated<StandardInput, PageListStandard>): State =>
  withInvestments(
    action.delta,
    action.item,
  )({
    ...state,
    monthly: {
      ...state.monthly,
      [action.page]: compose(
        setCost(
          state,
          action.delta.date ?? action.item?.date ?? new Date(),
          action.delta.category && investmentPurchaseCategories.includes(action.delta.category)
            ? 0
            : action.delta.cost ?? action.item?.cost ?? 0,
        ),
        setCost(
          state,
          action.item?.date ?? new Date(),
          isStandardListAction(action) &&
            action.item?.category &&
            investmentPurchaseCategories.includes(action.item.category)
            ? 0
            : -(action.item?.cost ?? 0),
        ),
      )(state.monthly[action.page]),
    },
  });

const onDelete = (state: State, action: ListItemDeleted<StandardInput, PageListStandard>): State =>
  withInvestments(
    null,
    action.item,
  )(
    action.item.category && investmentPurchaseCategories.includes(action.item.category)
      ? state
      : {
          ...state,
          monthly: {
            ...state.monthly,
            [action.page]: setCost(
              state,
              action.item.date,
              -action.item.cost,
            )(state.monthly[action.page]),
          },
        },
  );

const onFundPricesUpdated = (state: State, action: FundPricesUpdated): State => ({
  ...state,
  annualisedFundReturns: action.res.annualisedFundReturns ?? state.annualisedFundReturns,
  stocks: action.res.overviewCost,
});

const onReceiptCreated = (state: State, action: ActionReceiptCreated): State => ({
  ...state,
  monthly: action.items.reduce<State['monthly']>(
    (last, item) => ({
      ...last,
      [item.page]: setCost(state, new Date(item.date), item.cost)(last[item.page]),
    }),
    state.monthly,
  ),
});

export default function overview(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeApi.DataRead:
      return action.res ? onRead(state, action.res) : state;

    case ListActionType.Created:
      return isStandardListAction(action) && !action.fromServer ? onCreate(state, action) : state;
    case ListActionType.Updated:
      return isStandardListAction(action) && !action.fromServer ? onUpdate(state, action) : state;
    case ListActionType.Deleted:
      return isStandardListAction(action) && !action.fromServer ? onDelete(state, action) : state;

    case ListActionType.OverviewUpdated:
      return { ...state, monthly: { ...state.monthly, [action.page]: action.overviewCost } };
    case ListActionType.ReceiptCreated:
      return onReceiptCreated(state, action);

    case ActionTypeFunds.PricesUpdated:
      return onFundPricesUpdated(state, action);

    case ActionTypeLogin.LoggedOut:
    default:
      return state;
  }
}
