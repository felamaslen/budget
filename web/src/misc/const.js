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

export const DATA_KEY_ABBR = {
    id: 'I',
    date: 'd',
    item: 'i',
    cost: 'c',
    shop: 's',
    category: 'k',
    holiday: 'h',
    society: 'y',
    transactions: 'tr'
};

export const PAGES = {
    overview: {
        path: '/'
    },
    analysis: {},
    funds: {
        list: true,
        cols: ['date', 'item', 'transactions', 'cost']
    },
    income: {
        list: true,
        cols: ['date', 'item', 'cost']
    },
    bills: {
        list: true,
        cols: ['date', 'item', 'cost'],
        suggestions: ['item']
    },
    food: {
        list: true,
        cols: ['date', 'item', 'category', 'cost', 'shop'],
        daily: true,
        suggestions: ['item', 'category', 'shop']
    },
    general: {
        list: true,
        cols: ['date', 'item', 'category', 'cost', 'shop'],
        daily: true,
        suggestions: ['item', 'category', 'shop']
    },
    holiday: {
        list: true,
        cols: ['date', 'item', 'holiday', 'cost', 'shop'],
        daily: true,
        suggestions: ['item', 'holiday', 'shop']
    },
    social: {
        list: true,
        cols: ['date', 'item', 'society', 'cost', 'shop'],
        daily: true,
        suggestions: ['item', 'society', 'shop']
    }
};

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

export const LIST_COLS_MOBILE = ['date', 'item', 'cost'];

export const LOGIN_INPUT_LENGTH = 4;

export const AVERAGE_MEDIAN = 0xa1;
export const AVERAGE_EXP = 0xa2;

// maximum number of search suggestions to request
export const MAX_SUGGESTIONS = 5;

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

