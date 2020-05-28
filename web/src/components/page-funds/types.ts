import { GainsForRow } from '~client/selectors';
import { Data } from '~client/types';

export type FundProps = {
  name: string;
  isSold: boolean;
  gain: GainsForRow;
  prices: Data | null;
};

export type Sort = {
  criteria: 'value' | 'gain' | 'dayGain';
  direction: -1 | 1;
};

export const defaultSort: Sort = { criteria: 'value', direction: 1 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSort = (value: any | Sort): value is Sort =>
  value !== null &&
  typeof value === 'object' &&
  Object.keys(value).length === 2 &&
  Reflect.has(value, 'criteria') &&
  ['value', 'gain'].includes(value.criteria) &&
  Reflect.has(value, 'direction') &&
  [-1, 1].includes(value.direction);

export type HeadProps = {
  sort?: Sort;
  setSort: React.Dispatch<React.SetStateAction<Sort>>;
};
