import { GainsForRow } from '~client/selectors';
import type { RowPrices } from '~client/types';

export type FundProps = {
  isSold: boolean;
  gain: GainsForRow;
  prices: RowPrices;
};

export enum SortCriteria {
  Value = 'value',
  Gain = 'gain',
  GainAbs = 'gainAbs',
}

export type Sort = {
  criteria: SortCriteria;
  direction: -1 | 1;
};

export const defaultSort: Sort = { criteria: SortCriteria.Value, direction: 1 };

export type PageFundsContext = {
  sort?: Sort;
  setSort: React.Dispatch<React.SetStateAction<Sort>>;
  lastScraped: Date;
};
