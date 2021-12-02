import { FundMetadata } from '~client/selectors';
import type { Data } from '~client/types';

export type FundProps = {
  isSold: boolean;
  metadata: FundMetadata;
  prices: Data[] | null;
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
