import { Reducer } from 'redux';

import { Stock, Index } from '~client/types/funds';
import { Data } from '~client/types/graph';

export type State = {
  loading: boolean;
  indices: Index[];
  shares: Stock[];
  history: Data;
  lastPriceUpdate: number | null;
};

const reducer: Reducer<State>;
export default reducer;
