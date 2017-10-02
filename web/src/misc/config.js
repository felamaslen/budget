/**
 * Main config parameters for budget web app
 */

// show error messages for at most <delay> milliseconds
export const ERROR_MESSAGE_DELAY = 5000;

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;

// currency symbol
export const SYMBOL_CURRENCY_HTML = '\u00a3';
export const SYMBOL_CURRENCY_RAW = '£';

// debounce requests to update the server by 1 second
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
export const GRAPH_KEY_OFFSET_X = 45;
export const GRAPH_KEY_OFFSET_Y = 34;
export const GRAPH_CASHFLOW_NUM_TICKS = 5;

export const GRAPH_FUNDS_TENSION = 0.65;
export const GRAPH_FUNDS_MODES = ['ROI', 'Value', 'Price'];
export const GRAPH_FUNDS_POINT_RADIUS = 3;

export const STOCK_INDICES = (process.env.STOCK_INDICES || '')
    .split(',')
    .reduce((obj, item) => {
        const match = item.match(/^([\w.:]+)\/([\w\s.]+)$/);
        if (match) {
            obj[match[1]] = match[2];
        }

        return obj;
    }, {});

export const DO_STOCKS_LIST = process.env.DO_STOCKS_LIST === 'true';
export const STOCKS_GRAPH_RESOLUTION = 50;

export const LIST_BLOCK_WIDTH = 500;
export const LIST_BLOCK_HEIGHT = 300;

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
    balance: [36, 191, 55],
    balancePred: [36, 191, 55]
};

// fund colour scale
export const COLOR_FUND_DOWN = [255, 44, 44];
export const COLOR_FUND_UP = [0, 230, 18];

// all other colour definitions
export const COLOR_GRAPH_TITLE = [0, 0, 0];
export const COLOR_DARK = [51, 51, 51];
export const COLOR_LIGHT = [238, 238, 238];
export const COLOR_LIGHT_GREY = [153, 153, 153];
export const COLOR_TRANSLUCENT_LIGHT = [255, 255, 255, 0.5];
export const COLOR_TRANSLUCENT_DARK = [255, 255, 255, 0.8];

export const COLOR_PROFIT = [0, 204, 51];
export const COLOR_LOSS = [204, 51, 0];
export const COLOR_PROFIT_LIGHT = [244, 255, 244];
export const COLOR_LOSS_LIGHT = [255, 244, 244];

export const COLOR_BALANCE_ACTUAL = [0, 51, 153];
export const COLOR_BALANCE_PREDICTED = [255, 0, 0];
export const COLOR_BALANCE_STOCKS = [200, 200, 200, 0.5];
export const COLOR_SPENDING = [0, 51, 153];

export const COLOR_GRAPH_FUND_ITEM = [66, 134, 244];
export const COLOR_GRAPH_FUND_LINE = COLOR_GRAPH_TITLE;

