import { Action, ActionTypeApi, ActionTypeFunds, ActionApiDataRead } from '~client/actions';
import { DataKeyAbbr } from '~client/constants/api';
import { Period, DEFAULT_FUND_PERIOD } from '~client/constants/graph';
import { makeListReducer, onRead, ListState } from '~client/reducers/list';
import { Page, Fund, ReadResponseFunds } from '~client/types';

export type Cache = {
  startTime: number;
  cacheTimes: number[];
  prices: {
    [fundId: string]: {
      startIndex: number;
      values: number[];
    };
  };
};

type ExtraState = {
  viewSoldFunds: boolean;
  period: Period;
  cache: {
    [period in Period]?: Cache;
  };
};

export type State = ListState<Fund, ExtraState>;

export const initialState: State = {
  viewSoldFunds: false,
  items: [],
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

export default function funds(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeFunds.ViewSoldToggled:
      return { ...state, viewSoldFunds: !state.viewSoldFunds };
    case ActionTypeFunds.Requested:
      return state;
    case ActionTypeFunds.Received:
      return onPeriodLoad(state, action.res?.data, action.period);
    case ActionTypeApi.DataRead:
      return onReadFunds(state, action);
    default:
      return fundsListReducer(state, action);
  }
}
