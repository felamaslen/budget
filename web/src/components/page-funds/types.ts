import { GainsForRow } from '~client/selectors';
import { RowPrices } from '~client/types';

export type FundProps = {
  name: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSort = (value: any | Sort): value is Sort =>
  value !== null &&
  typeof value === 'object' &&
  Object.keys(value).length === 2 &&
  Reflect.has(value, 'criteria') &&
  Object.values(SortCriteria).includes(value.criteria) &&
  Reflect.has(value, 'direction') &&
  [-1, 1].includes(value.direction);

export type HeadProps = {
  sort?: Sort;
  setSort: React.Dispatch<React.SetStateAction<Sort>>;
};
