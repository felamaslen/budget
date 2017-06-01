/**
 * Main config parameters for budget web app
 */

// show error messages for <delay> milliseconds
export const ERROR_MESSAGE_DELAY = 8000;

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;

// colours for overview score scale and page categories
export const COLOR_CATEGORY = {
  'Stocks': [84, 110, 122],
  'Bills': [183, 28, 28],
  'Food': [67, 160, 71],
  'General': [1, 87, 155],
  'Holiday': [0, 137, 123],
  'Social': [191, 158, 36],
  'Income': [36, 191, 55],
  'Spending': [191, 36, 36],
  'Balance': [36, 191, 55]
};

// currency symbol
export const SYMBOL_CURRENCY_HTML = '\u00a3';
export const SYMBOL_CURRENCY_RAW = '£';

// update changes regularly with the server
export const TIMER_UPDATE_SERVER = 1000;

// error messages
export const ERROR_MSG_SERVER_UPDATE = 'Error updating server!';

