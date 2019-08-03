import { createReducerObject } from 'create-reducer-object';

import { replaceAtIndex } from '~client/modules/data';

import {
    STOCKS_LIST_CLEARED,
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCK_QUOTES_RECEIVED
} from '~client/constants/actions/stocks';

import { STOCK_INDICES } from '~client/constants/stocks';

/*
export const initialState = {
    loading: false,
    indices: [],
    shares: [],
    quotes: {}
};
*/

export const initialState = {
    loading: false,
    indices: [
        {
            code: 'SPX',
            name: 'S&P 500'
        },
        {
            code: 'FTSE',
            name: 'FTSE 100'
        }
    ],
    shares: [
        {
            code: 'CTY.L',
            name: 'City of London Investment Trust',
            weight: 0.3
        },
        {
            code: 'SMT.L',
            name: 'Scottish Mortgage Investment Trust',
            weight: 0.7
        }
    ],
    quotes: {
        'SMT.L': {
            timeSeries: [
                { date: '2019-08-02T20:40:00Z', close: 546 },
                { date: '2019-08-02T20:39:00Z', close: 544.3 },
                { date: '2019-08-02T20:38:00Z', close: 539 },
                { date: '2019-08-02T20:37:00Z', close: 542 }
            ],
            prevClose: 568.5
        }
    }
};

const onClear = () => initialState;

const onStocksList = (state, { res: { data: { stocks, total } } }) => ({
    loading: false,
    indices: Object.keys(STOCK_INDICES).map(code => ({
        code,
        name: STOCK_INDICES[code],
        gain: 0,
        up: false,
        down: false
    })),
    shares: stocks.reduce((last, [code, name, weight]) => {
        const codeIndex = last.findIndex(({ code: lastCode }) => lastCode === code);
        if (codeIndex === -1) {
            return last.concat([{
                code,
                name,
                weight: weight / total,
                gain: 0,
                price: null,
                up: false,
                down: false
            }]);
        }

        return replaceAtIndex(last, codeIndex, value => ({
            ...value,
            weight: value.weight + weight / total
        }), true);
    }, [])
});

const onQuoteUpdate = (state, { items }) => ({
    quotes: items.reduce((last, { code, data }) => ({
        ...last,
        [code]: data
    }), state.quotes)
});

const handlers = {
    [STOCKS_LIST_CLEARED]: onClear,
    [STOCKS_LIST_REQUESTED]: () => ({ loading: true }),
    [STOCKS_LIST_RECEIVED]: onStocksList,
    [STOCK_QUOTES_RECEIVED]: onQuoteUpdate
};

export default createReducerObject(handlers, initialState);
