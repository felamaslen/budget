import { Reducer } from 'redux';

import { LegacyRow } from '~client/types/funds';
import { WithCrud } from '~client/types/crud';
import { Period } from '~client/constants/graph';

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

export type State = {
  viewSoldFunds: boolean;
  items: WithCrud<LegacyRow>[];
  period: Period;
  cache: {
    [period in Period]?: Cache;
  };
};

type FundsReducer = Reducer<State>;

const fundsReducer: FundsReducer;
export default fundsReducer;
