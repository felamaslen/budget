import { Action } from 'create-reducer-object';

import { Page } from '~client/types/app';
import { makeListReducer, onRead, ListState } from '~client/reducers/list';
import { DATA_READ } from '~client/constants/actions/api';
import { FUNDS_VIEW_SOLD_TOGGLED, FUNDS_RECEIVED } from '~client/constants/actions/funds';
import { DataKeyAbbr } from '~client/constants/api';
import { Row, ItemRaw, ReadResponse } from '~client/types/funds';
import { Period, DEFAULT_FUND_PERIOD } from '~client/constants/graph';

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

export type State = ListState<Row, ExtraState>;

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

function getPriceCache(funds: ReadResponse): Cache {
  const { data, startTime, cacheTimes } = funds;

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

const onReadRows = onRead<Row, ExtraState>(Page.funds);

const onReadFunds = (state: State, action: Action): Partial<State> =>
  action.res.funds
    ? {
        ...onReadRows(state, action),
        cache: {
          ...state.cache,
          [state.period]: getPriceCache(action.res.funds),
        },
      }
    : {};

function onPeriodLoad(state: State, { res, period }: Action): Partial<State> {
  if (!res) {
    return { period };
  }

  return {
    period,
    cache: {
      ...state.cache,
      [period]: getPriceCache(res.data),
    },
  };
}

const handlers = {
  [FUNDS_VIEW_SOLD_TOGGLED]: ({ viewSoldFunds }: State): Partial<State> => ({
    viewSoldFunds: !viewSoldFunds,
  }),
  [DATA_READ]: onReadFunds,
  [FUNDS_RECEIVED]: onPeriodLoad,
};

export default makeListReducer<Row, ItemRaw, ExtraState>(Page.funds, handlers, initialState);
