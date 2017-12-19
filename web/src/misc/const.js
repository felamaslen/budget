/**
 * Constant items
 */

import { widthPageMobile } from '../constants/styles';

export const mediaQueries = {
    mobile: `(max-width: ${widthPageMobile}px)`,
    desktop: `(min-width: ${widthPageMobile + 1}px)`
};

export const API_VERSION = 3;
export const API_PREFIX = `api/v${API_VERSION}`;

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

export const PAGES_PATHS = [
    '/',
    '/analysis',
    '/funds',
    '/income',
    '/bills',
    '/food',
    '/general',
    '/holiday',
    '/social'
];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map(item => item.substring(0, 3));
export const OVERVIEW_COLUMNS = [
    ['month', 'Month'],
    ['funds', 'Stocks'],
    ['bills', 'Bills'],
    ['food', 'Food'],
    ['general', 'General'],
    ['holiday', 'Holiday'],
    ['social', 'Social'],
    ['income', 'Income'],
    ['spending', 'Out'],
    ['net', 'Net'],
    ['predicted', 'Predicted'],
    ['balance', 'Balance'],
    ['balancePred', 'Balance']
];

export const LIST_PAGES = [2, 3, 4, 5, 6, 7, 8];
export const BLOCK_PAGES = [5, 6, 7, 8];

export const LIST_COLS_PAGES = [
    null, // overview (not list)
    null, // analysis (not list)
    ['date', 'item', 'transactions', 'cost'], // funds
    ['date', 'item', 'cost'], // income
    ['date', 'item', 'cost'], // bills
    ['date', 'item', 'category', 'cost', 'shop'], // food
    ['date', 'item', 'category', 'cost', 'shop'], // general
    ['date', 'item', 'holiday', 'cost', 'shop'], // holiday
    ['date', 'item', 'society', 'cost', 'shop'] // social
];
export const LIST_COLS_SHORT = [
    null,
    null,
    ['d', 'i', 'tr', 'c'],
    ['d', 'i', 'c'],
    ['d', 'i', 'c'],
    ['d', 'i', 'k', 'c', 's'],
    ['d', 'i', 'k', 'c', 's'],
    ['d', 'i', 'h', 'c', 's'],
    ['d', 'i', 'y', 'c', 's']
];
export const LIST_COLS_STANDARD = ['I', 'd', 'i', 'c', 'k', 'h', 'y', 's', 'tr'];

export const LIST_COLS_MOBILE = ['date', 'item', 'cost'];

// which pages to include daily tallies for
export const DAILY_PAGES = [null, null, false, false, false, true, true, true, true];

export const LOGIN_INPUT_LENGTH = 4;
export const AVERAGE_MEDIAN = 0xa1;
export const AVERAGE_EXP = 0xa2;

// maximum number of search suggestions to request
export const MAX_SUGGESTIONS = 5;

export const LIST_COLS_SUGGESTIONS = [
    [], // overview (not list)
    [], // analysis (not list)
    [], // funds (no suggestions)
    ['item'],
    ['item'],
    ['item', 'category', 'shop'],
    ['item', 'category', 'shop'],
    ['item', 'holiday', 'shop'],
    ['item', 'society', 'shop']
];

export const htmlCanvasSupported = () => {
    if (typeof navigator === 'undefined') {
        return false;
    }

    if (navigator.userAgent === 'node.js') {
        return false;
    }

    const elem = document.createElement('canvas');

    return Boolean(elem.getContext && elem.getContext('2d'));
};

export const GRAPH_WIDTH = 500;
export const GRAPH_HEIGHT = 300;
export const GRAPH_SPEND_CATEGORIES = [
    { name: 'bills', key: 15 },
    { name: 'food', key: 67 },
    { name: 'general', key: 125 },
    { name: 'holiday', key: 195 },
    { name: 'social', key: 260 }
];

export const GRAPH_FUND_ITEM_WIDTH = 100;
export const GRAPH_FUND_ITEM_HEIGHT = 48;
export const GRAPH_FUND_ITEM_WIDTH_LARGE = 300;
export const GRAPH_FUND_ITEM_HEIGHT_LARGE = 120;

export const GRAPH_FUNDS_WIDTH = 500;
export const GRAPH_FUNDS_HEIGHT = 300;
export const GRAPH_FUNDS_MODE_ROI = 0;
export const GRAPH_FUNDS_MODE_ABSOLUTE = 1;
export const GRAPH_FUNDS_MODE_PRICE = 2;
export const GRAPH_FUNDS_PERIODS = [
    ['year1', '1 year'],
    ['year5', '5 years'],
    ['month1', '1 month'],
    ['month3', '3 months']
];
export const GRAPH_FUNDS_NUM_TICKS = 10;

export const GRAPH_STOCKS_WIDTH = 150;
export const GRAPH_STOCKS_HEIGHT = 72;

export const GRAPH_ZOOM_SPEED = 0.1;
export const GRAPH_ZOOM_MAX = 0.01;

export const ANALYSIS_PERIODS = ['year', 'month', 'week'];
export const ANALYSIS_GROUPINGS = ['category', 'shop'];
export const ANALYSIS_VIEW_WIDTH = 500;
export const ANALYSIS_VIEW_HEIGHT = 500;

