// debounce requests to update the server by 1 second
export const TIMER_UPDATE_SERVER = 1000;

export const API_VERSION = 4;
export const API_PREFIX = `/api/v${API_VERSION}`;
export const API_BACKOFF_TIME = 5000;

export const LOGIN_INPUT_LENGTH = 4;

export const CREATE_ID = 'CREATE_ID';

export const CREATE = 'CREATE';
export const READ = 'READ';
export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

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
    ['netWorthPredicted', 'Predicted'],
    ['netWorth', 'Net Worth', '/net-worth']
];

export const PAGES = {
    overview: {
        path: '/',
        cols: ['balance']
    },
    analysis: {},
    funds: {
        list: true,
        cols: ['item', 'transactions']
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

export const PAGES_LIST = ['funds', 'income', 'bills', 'food', 'general', 'holiday', 'social'];
export const PAGES_SUGGESTIONS = ['income', 'bills', 'food', 'general', 'holiday', 'social'];

export const LIST_COLS_MOBILE = ['date', 'item', 'cost'];

// maximum number of search suggestions to request
export const MAX_SUGGESTIONS = 5;

export const NET_WORTH_AGGREGATE = {
    'cash-easy-access': 'Cash (easy access)',
    'cash-other': 'Cash (other)',
    stocks: 'Stocks',
    pension: 'Pension'
};
