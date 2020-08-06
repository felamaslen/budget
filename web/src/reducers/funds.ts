import { replaceAtIndex } from 'replace-array';
import {
  Action,
  ActionTypeApi,
  ActionTypeFunds,
  ActionApiDataRead,
  ListActionType,
} from '~client/actions';
import { DataKeyAbbr } from '~client/constants/api';
import { Period, DEFAULT_FUND_PERIOD } from '~client/constants/graph';
import { makeListReducer, onRead, ListState } from '~client/reducers/list';
import { Page, Fund, ReadResponseFunds, RequestType } from '~client/types';

export type Cache = {
  startTime: number;
  cacheTimes: number[];
  prices: {
    [fundId: number]: {
      startIndex: number;
      values: number[];
    };
  };
};

type ExtraState = {
  viewSoldFunds: boolean;
  cashTarget: number;
  period: Period;
  cache: {
    [period in Period]?: Cache;
  };
};

export type State = ListState<Fund, ExtraState>;

export const initialState: State = {
  viewSoldFunds: false,
  cashTarget: 0,
  items: [],
  __optimistic: [],
  period: DEFAULT_FUND_PERIOD,
  cache: {
    [DEFAULT_FUND_PERIOD]: {
      startTime: 0,
      cacheTimes: [],
      prices: {},
    },
  },
};

function getPriceCache({ data, startTime, cacheTimes }: ReadResponseFunds): Cache {
  const prices = data.reduce(
    (last, { [DataKeyAbbr.id]: id, pr, prStartIndex }) => ({
      ...last,
      [id]: { startIndex: prStartIndex, values: pr },
    }),
    {},
  );

  return {
    startTime,
    cacheTimes,
    prices,
  };
}

const onReadRows = onRead<Fund, Page.funds, ExtraState>(Page.funds);

const onPeriodLoad = (
  state: State,
  res?: ReadResponseFunds,
  period: Period = state.period,
): State => ({
  ...state,
  period,
  cashTarget: res?.cashTarget ?? state.cashTarget,
  cache: res
    ? {
        ...state.cache,
        [period]: getPriceCache(res),
      }
    : state.cache,
});

const onReadFunds = (state: State, action: ActionApiDataRead): State =>
  action.res.funds
    ? onPeriodLoad(
        {
          ...state,
          ...onReadRows(state, action),
        },
        action.res.funds,
      )
    : state;

const fundsListReducer = makeListReducer<Fund, Page.funds, ExtraState>(Page.funds, initialState);

export const getRemainingAllocation = (state: State, id: number): number =>
  state.items
    .filter((fund) => fund.id !== id)
    .reduce<number>(
      (last, { allocationTarget }) => last - Number((allocationTarget * 100).toFixed()),
      100,
    ) / 100;

const replaceAllocationTarget = (
  state: State,
  id: number,
  nextAllocationTarget: number,
): State => ({
  ...state,
  items: replaceAtIndex(
    state.items,
    state.items.findIndex((fund) => fund.id === id),
    (fund) => ({
      ...fund,
      allocationTarget: nextAllocationTarget,
    }),
  ),
});

const fillAllocationTargets = (state: State, createdId: number): State =>
  replaceAllocationTarget(state, createdId, getRemainingAllocation(state, createdId));

function updateAllocationTargets(state: State, changedId: number): State {
  const updatedAllocationTarget =
    state.items.find(
      ({ id }, index) => state.__optimistic[index] !== RequestType.delete && id === changedId,
    )?.allocationTarget ?? 0;

  const remainingAllocation = getRemainingAllocation(state, changedId);
  const nextAllocationTarget = Math.min(remainingAllocation, updatedAllocationTarget);

  return replaceAllocationTarget(state, changedId, nextAllocationTarget);
}

export default function funds(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeFunds.ViewSoldToggled:
      return { ...state, viewSoldFunds: !state.viewSoldFunds };
    case ActionTypeFunds.CashTargetUpdated:
      return { ...state, cashTarget: action.cashTarget };
    case ActionTypeFunds.Requested:
      return state;
    case ActionTypeFunds.Received:
      return onPeriodLoad(state, action.res?.data, action.period);
    case ActionTypeApi.DataRead:
      return onReadFunds(state, action);
    case ListActionType.Created:
      return fillAllocationTargets(fundsListReducer(state, action), action.fakeId);
    case ListActionType.Updated:
    case ListActionType.Deleted:
      return updateAllocationTargets(fundsListReducer(state, action), action.id);
    default:
      return fundsListReducer(state, action);
  }
}
