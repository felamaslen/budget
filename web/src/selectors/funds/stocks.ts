import { State } from '~client/reducers';
import { Stock, Index } from '~client/types/funds';

export const getStocks = (state: Pick<State, 'stocks'>): Stock[] => state.stocks.shares;
export const getIndices = (state: Pick<State, 'stocks'>): Index[] => state.stocks.indices;
