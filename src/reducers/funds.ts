import { OptimisticItem } from '~/types/crud';
import { Fund, Prices, Period, expandPeriod } from '~/types/funds';

import createReducer from '~/reducers/create-reducer';

export type State = {
  viewSoldFunds: boolean;
  items: OptimisticItem<Fund>[];
  period: Period;
  cache: {
    [period: string]: {
      startTime: Date;
      cacheTimes: number[];
      prices: Prices;
    };
  };
};

const initialPeriodRaw = process.env.DEFAULT_FUND_PERIOD || '';
const initialPeriodExpanded = expandPeriod(initialPeriodRaw);
const initialPeriod = initialPeriodExpanded.join('');

export const initialState: State = {
  viewSoldFunds: false,
  items: [],
  period: initialPeriodExpanded,
  cache: {
    [initialPeriod]: {
      startTime: new Date(),
      cacheTimes: [],
      prices: {},
    },
  },
};

const fundsReducer = createReducer<State>({
  initialState,
  handlers: {},
});

export default fundsReducer;

export { fundsReducer as reducer };
