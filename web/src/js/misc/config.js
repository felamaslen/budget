/**
 * Main config parameters for budget web app
 */

// show error messages for at least <delay> milliseconds
export const ERROR_MESSAGE_DELAY = 5000;

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;

// currency symbol
export const SYMBOL_CURRENCY_HTML = '\u00a3';
export const SYMBOL_CURRENCY_RAW = '£';

// update changes regularly with the server
export const TIMER_UPDATE_SERVER = 1000;

// error messages
export const ERROR_MSG_SERVER_UPDATE = 'Error updating server!';
export const ERROR_MSG_BAD_DATA = 'Please enter valid data';
export const ERROR_MSG_BUG_INVALID_ITEM = 'Bug: no date/cost on edited item';

// font definitions
export const FONT_AXIS_LABEL = '11px Arial, Helvetica, sans-serif';
export const FONT_GRAPH_TITLE = '16px bold Arial, Helvetica, sans-serif';
export const FONT_GRAPH_TITLE_LARGE = '18px bold Arial, Helvetica, sans-serif';
export const FONT_GRAPH_KEY = '13px Arial, Helvetica, sans-serif';
export const FONT_GRAPH_KEY_SMALL = '11px Arial, Helvetica, sans-serif';

export const GRAPH_KEY_SIZE = 12;
export const GRAPH_KEY_OFFSET_X = 5;
export const GRAPH_KEY_OFFSET_Y = 34;
export const GRAPH_BALANCE_NUM_TICKS = 5;

export const GRAPH_FUNDS_TENSION = 0.65;
export const GRAPH_FUNDS_MODES = ['ROI', 'Value', 'Price'];
export const GRAPH_FUNDS_POINT_RADIUS = 3;

export const STOCK_INDICES = {
  'LON:CTY': 'CTY',
  'INDEXFTSE:UKX': 'FTSE 100',
  'INDEXSP:.INX': 'S&P 500',
  'INDEXDJX:.DJI': 'DJIA',
  'INDEXNASDAQ:NDX': 'NASDAQ 100',
  'INDEXNIKKEI:NI225': 'Nikkei 225'
};

export const DO_STOCKS_LIST = true;
export const STOCKS_GRAPH_RESOLUTION = 50;

// colours for overview score scale and page categories
export const COLOR_CATEGORY = {
  funds: [84, 110, 122],
  bills: [183, 28, 28],
  food: [67, 160, 71],
  general: [1, 87, 155],
  holiday: [0, 137, 123],
  social: [191, 158, 36],
  income: [36, 191, 55],
  spending: [191, 36, 36],
  balance: [36, 191, 55]
};

// fund colour scale
export const COLOR_FUND_DOWN = [255, 44, 44];
export const COLOR_FUND_UP = [0, 230, 18];

// all other colour definitions
export const COLOR_GRAPH_TITLE = '#000';
export const COLOR_DARK = '#333';
export const COLOR_LIGHT = '#eee';
export const COLOR_LIGHT_GREY = '#999';
export const COLOR_TRANSLUCENT_LIGHT = 'rgba(255, 255, 255, 0.5)';
export const COLOR_TRANSLUCENT_DARK = 'rgba(255, 255, 255, 0.8)';

export const COLOR_PROFIT = '#0c3';
export const COLOR_LOSS = '#c30';
export const COLOR_PROFIT_LIGHT = '#f4fff4';
export const COLOR_LOSS_LIGHT = '#fff4f4';

export const COLOR_BALANCE_ACTUAL = '#039';
export const COLOR_BALANCE_PREDICTED = '#f00';
export const COLOR_BALANCE_STOCKS = 'rgba(200, 200, 200, 0.5)';

export const COLOR_GRAPH_FUND_ITEM = '#4286f4';
export const COLOR_GRAPH_FUND_LINE = COLOR_GRAPH_TITLE;

