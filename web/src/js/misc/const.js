/**
 * Constant items
 */

export const ERROR_LEVEL_ERROR = 0xe0;
export const ERROR_LEVEL_WARN = 0xe1;
export const ERROR_LEVEL_DEBUG = 0xe2;
export const ERROR_CLOSE_TIME = 1000;

export const PAGES = [
  'overview',
  'analysis',
  'funds',
  'income',
  'bills',
  'food',
  'general',
  'holiday',
  'social'
];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map(item => item.substring(0, 3));
export const OVERVIEW_COLUMNS = ['Month', 'Stocks', 'Bills', 'Food', 'General', 'Holiday',
  'Social', 'Income', 'Spending', 'Net', 'Predicted', 'Balance'];

export const LIST_PAGES = [2, 3, 4, 5, 6, 7, 8];

export const LIST_COLS_PAGES = [
  null, // overview (not list)
  null, // analysis (not list)
  ['date', 'item', 'transactions', 'cost'], // funds
  ['date', 'item', 'cost'], // income
  ['date', 'item', 'cost'], // bills
  ['date', 'item', 'category', 'cost', 'shop'], // food
  ['date', 'item', 'category', 'cost', 'shop'], // general
  ['date', 'item', 'holiday', 'cost', 'shop'], // holiday
  ['date', 'item', 'social', 'cost', 'shop'] // social
];
export const LIST_COLS_SHORT = [
  null,
  null,
  ['d', 'i', 't', 'c'],
  ['d', 'i', 'c'],
  ['d', 'i', 'c'],
  ['d', 'i', 'k', 'c', 's'],
  ['d', 'i', 'k', 'c', 's'],
  ['d', 'i', 'h', 'c', 's'],
  ['d', 'i', 'y', 'c', 's']
];

// which pages to include daily tallies for
export const DAILY_PAGES = [null, null, false, false, true, true, true, true, true];

export const LOGIN_INPUT_LENGTH = 4;
export const AVERAGE_MEDIAN = 0xa1;
export const SERVER_UPDATE_IDLE = 0;
export const SERVER_UPDATE_REQUESTED = 0xf91;
export const SERVER_UPDATE_RECEIVED = 0xf92;
export const SERVER_UPDATE_ERROR = 0xf93;

