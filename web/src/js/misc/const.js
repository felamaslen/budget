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

export const LOGIN_INPUT_LENGTH = 4;

export const AVERAGE_MEDIAN = 0xa1;

