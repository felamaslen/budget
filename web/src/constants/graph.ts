import { Padding } from '~client/types/graph';

const defaultFont = 'Arial, Helvetica, sans-serif';

type Font = [number, string];

export const FONT_GRAPH_TITLE: Font = [16, defaultFont];
export const FONT_GRAPH_KEY: Font = [11, defaultFont];
export const FONT_AXIS_LABEL: Font = FONT_GRAPH_KEY;

export const GRAPH_CURVINESS = 0.35;
export const GRAPH_WIDTH = 500;
export const GRAPH_HEIGHT = 300;

export const GRAPH_ZOOM_SPEED = 0.15;

export const GRAPH_CASHFLOW_NUM_TICKS = 5;
export const GRAPH_CASHFLOW_PADDING: Padding = [40, 0, 0, 0];

type SpendCategory = { name: string; key: number };

export const GRAPH_SPEND_CATEGORIES: SpendCategory[] = [
  { name: 'bills', key: 15 },
  { name: 'food', key: 67 },
  { name: 'general', key: 125 },
  { name: 'holiday', key: 195 },
  { name: 'social', key: 260 },
];

export const GRAPH_FUNDS_OVERALL_ID = 'overall';

export const GRAPH_FUND_ITEM_WIDTH = 100;
export const GRAPH_FUND_ITEM_HEIGHT = 48;
export const GRAPH_FUND_ITEM_WIDTH_LARGE = 300;
export const GRAPH_FUND_ITEM_HEIGHT_LARGE = 120;

export const GRAPH_FUNDS_WIDTH = 500;
export const GRAPH_FUNDS_HEIGHT = 300;

export enum Mode {
  ROI = 'ROI',
  Value = 'Value',
  Price = 'Price',
}

export const GRAPH_FUNDS_MODE_ROI = Mode.ROI;
export const GRAPH_FUNDS_MODE_ABSOLUTE = Mode.Value;
export const GRAPH_FUNDS_MODE_PRICE = Mode.Price;

export enum Period {
  year1 = '1 year',
  year5 = '5 years',
  month1 = '1 month',
  month3 = '3 months',
}

export const GRAPH_FUNDS_PERIODS = Object.entries(Period);

export const DEFAULT_FUND_PERIOD: Period = GRAPH_FUNDS_PERIODS.reduce(
  (last: Period, [shortPeriod, next]): Period =>
    shortPeriod === process.env.DEFAULT_FUND_PERIOD ? next : last,
  Period.year1,
);

export const GRAPH_FUNDS_NUM_TICKS = 10;

export const GRAPH_STOCKS_WIDTH = 150;
export const GRAPH_STOCKS_HEIGHT = 72;
