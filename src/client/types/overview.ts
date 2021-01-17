import type { Monthly } from './gql';
import type { GQL } from './shared';

export type MonthlyProcessed = GQL<Monthly> & {
  stocks: number[];
  pension: number[];
  lockedCash: number[];
  homeEquity: number[];
  options: number[];
  netWorth: number[];
  income: number[];
  spending: number[];
  net: number[];
};

export type MonthlyProcessedKey = keyof Omit<MonthlyProcessed, keyof Monthly>;

export type MonthlyWithPartialProcess = GQL<Monthly> &
  Partial<Omit<MonthlyProcessed, keyof Monthly>>;
export type MonthlyWithProcess<K extends MonthlyProcessedKey> = Monthly & Pick<MonthlyProcessed, K>;

export type TableValues<T = never, K extends keyof MonthlyProcessed = keyof MonthlyProcessed> = {
  [key in K]: T;
} & {
  netWorth: T;
};

export type OverviewHeader = keyof GQL<Monthly> | 'stocks' | 'netWorth' | 'spending' | 'net';

export type OverviewCell = {
  value: number;
  rgb: string;
};

export type OverviewTableRow = {
  year: number;
  month: number;
  monthText: string;
  cells: { [column in OverviewHeader]: OverviewCell };
  past: boolean;
  active: boolean;
  future: boolean;
};

export type OverviewTable = OverviewTableRow[];

export type OverviewColumn = {
  name: string;
  link?: {
    to: string;
    replace?: boolean;
  };
  include?: (keyof MonthlyProcessed)[];
  exclude?: (keyof MonthlyProcessed)[];
};

export type OverviewTableColumn = [OverviewHeader, OverviewColumn];

export type SplitRange = {
  min: number;
  maxNegative?: number;
  minPositive?: number;
  max: number;
};

export type Median = {
  positive: number;
  negative: number;
};
