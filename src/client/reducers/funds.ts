import getUnixTime from 'date-fns/getUnixTime';
import { replaceAtIndex } from 'replace-array';
import {
  Action,
  ActionTypeApi,
  ActionTypeFunds,
  ActionApiDataRead,
  AllocationTargetsUpdated,
  TodayPricesFetched,
} from '~client/actions';
import { lastInArray, toNativeFund } from '~client/modules/data';
import { makeListReducer, ListState } from '~client/reducers/list';
import type { FundNative, FundQuotes } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import type { FundHistory, FundInput, FundPriceGroup } from '~client/types/gql';
import type { GQL } from '~shared/types';

type ExtraState = {
  viewSoldFunds: boolean;
  cashTarget: number;
  startTime: number;
  cacheTimes: number[];
  prices: {
    [fundId: number]: FundPriceGroup[];
  };
  todayPrices: FundQuotes;
  todayPriceFetchTime: number | null;
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
  todayPriceFetchTime: null,
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

const onPeriodLoad = (state: State, res: FundHistory | null | undefined): State =>
  res ? { ...state, ...getPriceCache(res) } : state;

const onReadFunds = (state: State, action: ActionApiDataRead): State =>
  onPeriodLoad(
    {
      ...state,
      items: action.res.funds?.items.map(toNativeFund) ?? [],
      __optimistic: Array<undefined>(action.res.funds?.items?.length ?? 0).fill(undefined),
      cashTarget: action.res.cashAllocationTarget ?? state.cashTarget,
    },
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

function onTodayPricesFetched(state: State, action: TodayPricesFetched): State {
  const noPricesUpdated = Object.entries(action.quotes).every(([id, latestPrice]) => {
    const scrapedPrices = state.prices[Number(id)] ?? [];
    return lastInArray(lastInArray(scrapedPrices)?.values ?? []) === latestPrice;
  });

  if (noPricesUpdated) {
    return { ...state, todayPrices: {}, todayPriceFetchTime: null };
  }

  return {
    ...state,
    todayPrices: { ...state.todayPrices, ...action.quotes },
    todayPriceFetchTime: getUnixTime(
      action.refreshTime ? new Date(action.refreshTime) : new Date(),
    ),
  };
}

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
      return onTodayPricesFetched(state, action);
    case ActionTypeApi.DataRead:
      return onReadFunds(state, action);
    default:
      return fundsListReducer(state, action);
  }
}
