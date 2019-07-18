const defaultFont = 'Arial, Helvetica, sans-serif';
export const FONT_GRAPH_TITLE = [16, defaultFont];
export const FONT_GRAPH_KEY = [11, defaultFont];
export const FONT_AXIS_LABEL = FONT_GRAPH_KEY;

export const GRAPH_CURVINESS = 0.35;
export const GRAPH_WIDTH = 500;
export const GRAPH_HEIGHT = 300;

export const GRAPH_ZOOM_SPEED = 0.15;

export const GRAPH_KEY_SIZE = 12;
export const GRAPH_KEY_OFFSET_X = 45;
export const GRAPH_KEY_OFFSET_Y = 34;

export const GRAPH_CASHFLOW_NUM_TICKS = 5;
export const GRAPH_CASHFLOW_PADDING = [40, 0, 0, 0];
export const GRAPH_SPEND_CATEGORIES = [
    { name: 'bills', key: 15 },
    { name: 'food', key: 67 },
    { name: 'general', key: 125 },
    { name: 'holiday', key: 195 },
    { name: 'social', key: 260 }
];

export const GRAPH_FUNDS_POINT_RADIUS = 3;

export const GRAPH_FUNDS_OVERALL_ID = 'overall';

export const GRAPH_FUND_ITEM_WIDTH = 100;
export const GRAPH_FUND_ITEM_HEIGHT = 48;
export const GRAPH_FUND_ITEM_WIDTH_LARGE = 300;
export const GRAPH_FUND_ITEM_HEIGHT_LARGE = 120;

export const GRAPH_FUNDS_WIDTH = 500;
export const GRAPH_FUNDS_HEIGHT = 300;

export const GRAPH_FUNDS_MODE_ROI = 'MODE_ROI';
export const GRAPH_FUNDS_MODE_ABSOLUTE = 'MODE_ABSOLUTE';
export const GRAPH_FUNDS_MODE_PRICE = 'MODE_PRICE';

export const GRAPH_FUNDS_MODES = {
    [GRAPH_FUNDS_MODE_ROI]: 'ROI',
    [GRAPH_FUNDS_MODE_ABSOLUTE]: 'Value',
    [GRAPH_FUNDS_MODE_PRICE]: 'Price'
};

export const GRAPH_FUNDS_PERIODS = [
    ['year1', '1 year'],
    ['year5', '5 years'],
    ['month1', '1 month'],
    ['month3', '3 months']
];
export const GRAPH_FUNDS_NUM_TICKS = 10;

export const GRAPH_STOCKS_WIDTH = 150;
export const GRAPH_STOCKS_HEIGHT = 72;
