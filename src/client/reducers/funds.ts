import { replaceAtIndex } from 'replace-array';
import {
  Action,
  ActionTypeApi,
  ActionTypeFunds,
  ActionApiDataRead,
  AllocationTargetsUpdated,
} from '~client/actions';
import { toNativeFund } from '~client/modules/data';
import { makeListReducer, onRead, ListState } from '~client/reducers/list';
import type { FundNative, FundQuotes, GQL } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import type { Fund, FundHistory, FundInput, FundPriceGroup } from '~client/types/gql';

type ExtraState = {
  viewSoldFunds: boolean;
  cashTarget: number;
  startTime: number;
  cacheTimes: number[];
  prices: {
    [fundId: number]: FundPriceGroup[];
  };
  todayPrices: FundQuotes;
};

export type State = ListState<GQL<FundNative>, ExtraState>;

export const initialState: State = {
  viewSoldFunds: false,
  cashTarget: 0,
  items: [],
  __optimistic: [],
  startTime: 0,
  cacheTimes: [],
  prices: [],
  todayPrices: {},
};

const getPriceCache = ({
  startTime,
  cacheTimes,
  prices,
}: FundHistory): Pick<State, 'startTime' | 'cacheTimes' | 'prices'> => ({
  startTime,
  cacheTimes,
  prices: prices.reduce<Record<number, FundPriceGroup[]>>(
    (last, { fundId, groups }) => ({
      ...last,
      [fundId]: groups,
    }),
    {},
  ),
});

const onReadRows = onRead<PageNonStandard.Funds, GQL<Fund>, FundNative, State>(
  PageNonStandard.Funds,
  toNativeFund,
);

const onPeriodLoad = (state: State, res: FundHistory | null | undefined): State =>
  res ? { ...state, ...getPriceCache(res) } : state;

const onReadFunds = (state: State, action: ActionApiDataRead): State =>
  onPeriodLoad(
    { ...onReadRows(state, action), cashTarget: action.res.cashAllocationTarget ?? 0 },
    action.res.fundHistory,
  );

const fundsListReducer = makeListReducer<
  GQL<FundInput>,
  GQL<FundNative>,
  PageNonStandard.Funds,
  ExtraState
>(PageNonStandard.Funds, initialState);

const updateAllocationTargets = (state: State, action: AllocationTargetsUpdated): State => ({
  ...state,
  items: action.deltas.reduce<State['items']>(
    (last, { id, allocationTarget }) =>
      replaceAtIndex(
        last,
        last.findIndex((compare) => compare.id === id),
        (fund) => ({
          ...fund,
          allocationTarget,
        }),
      ),
    state.items,
  ),
});

export default function funds(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeFunds.ViewSoldToggled:
      return { ...state, viewSoldFunds: !state.viewSoldFunds };
    case ActionTypeFunds.CashTargetUpdated:
      return { ...state, cashTarget: action.cashTarget };
    case ActionTypeFunds.AllocationTargetsUpdated:
      return updateAllocationTargets(state, action);
    case ActionTypeFunds.PricesUpdated:
      return onPeriodLoad(state, action.res);
    case ActionTypeFunds.TodayPricesFetched:
      return { ...state, todayPrices: { ...state.todayPrices, ...action.quotes } };
    case ActionTypeApi.DataRead:
      return onReadFunds(state, action);
    default:
      return fundsListReducer(state, action);
  }
}
