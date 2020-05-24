import { GainsForRow } from '~client/selectors';
import { Data } from '~client/types';

export type FundProps = {
  name: string;
  isSold: boolean;
  gain: GainsForRow;
  prices: Data | null;
};
