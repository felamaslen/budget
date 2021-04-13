import type { Padding, PageListCost, HistoryOptions } from '~client/types';
import { FundPeriod, PageListStandard } from '~client/types/enum';
import type { QueryFundHistoryArgs } from '~client/types/gql';

const defaultFont = 'Arial, Helvetica, sans-serif';

type Font = [number, string];

export const FONT_GRAPH_TITLE: Font = [16, defaultFont];
export const FONT_GRAPH_KEY: Font = [11, defaultFont];
export const FONT_AXIS_LABEL: Font = FONT_GRAPH_KEY;

export const GRAPH_CURVINESS = 0.35;
export const GRAPH_WIDTH = 500;
export const GRAPH_HEIGHT = 300;

export const GRAPH_ZOOM_SPEED = 0.15;

export const GRAPH_CASHFLOW_PADDING: Padding = [40, 0, 0, 0];

export const GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS = 30;

type SpendCategory = { name: PageListCost; key: number };

export const GRAPH_SPEND_CATEGORIES: SpendCategory[] = [
  { name: PageListStandard.Bills, key: 15 },
  { name: PageListStandard.Food, key: 67 },
  { name: PageListStandard.General, key: 125 },
  { name: PageListStandard.Holiday, key: 195 },
  { name: PageListStandard.Social, key: 260 },
];

export const GRAPH_FUNDS_OVERALL_ID = -1;

export const GRAPH_FUND_ITEM_WIDTH = 100;
export const GRAPH_FUND_ITEM_HEIGHT = 48;
export const GRAPH_FUND_ITEM_WIDTH_LARGE = 300;
export const GRAPH_FUND_ITEM_HEIGHT_LARGE = 120;

export const GRAPH_FUNDS_WIDTH = 500;
export const GRAPH_FUNDS_HEIGHT = 300;

export enum Mode {
  ROI = 'ROI',
  Value = 'Value',
  Stacked = 'Value (stacked)',
  Price = 'Price',
  PriceNormalised = 'Price (normalised)',
}

export const isHistoryOptionsEqual = (a: QueryFundHistoryArgs, b: QueryFundHistoryArgs): boolean =>
  a.period === b.period && a.length === b.length;

export const fundHistoryMatch = (query: QueryFundHistoryArgs) => (
  compare: HistoryOptions,
): boolean => isHistoryOptionsEqual(query, compare);

export const defaultFundPeriod = FundPeriod.Year;
export const defaultFundLength = 1;

export const GRAPH_FUNDS_NUM_TICKS = 10;
