import { createReducerObject } from 'create-reducer-object';

import { replaceAtIndex, limitTimeSeriesLength } from '~client/modules/data';

import {
    STOCKS_LIST_REQUESTED,
    STOCKS_LIST_RECEIVED,
    STOCKS_PRICES_RECEIVED
} from '~client/constants/actions/stocks';

import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '~client/constants/stocks';

export const initialState = {
    loading: false,
    indices: Object.keys(STOCK_INDICES).map(code => ({
        code,
        name: STOCK_INDICES[code],
        gain: 0,
        up: false,
        down: false
    })),
    shares: [],
    history: [],
    lastPriceUpdate: null
};

const onStocksList = (state, { res: { data: { stocks, total } } }) => ({
    loading: false,
    lastPriceUpdate: null,
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

const updateStock = prices => ({ code, gain, ...rest }) => {
    const match = prices.find(({ code: priceCode }) => priceCode === code);
    if (!match) {
        return { code, gain, ...rest };
    }

    const { open, close } = match;
    const newGain = 100 * (close - open) / open;

    return {
        ...rest,
        code,
        gain: newGain,
        up: gain !== null && newGain > gain,
        down: gain !== null && newGain < gain,
        price: close
    };
};

function onStocksPrices(state, { res }) {
    if (!res) {
        return {};
    }

    const lastPriceUpdate = Date.now();
    const stockMapper = updateStock(res);
    const shares = state.shares.map(stockMapper);

    const weightedGain = shares.reduce((last, { gain, weight }) => last + gain * weight, 0);

    return {
        lastPriceUpdate,
        indices: state.indices.map(stockMapper),
        shares,
        history: limitTimeSeriesLength(state.history, STOCKS_GRAPH_RESOLUTION)
            .concat([[Date.now(), weightedGain]])
    };
}

const handlers = {
    [STOCKS_LIST_REQUESTED]: () => ({ loading: true }),
    [STOCKS_LIST_RECEIVED]: onStocksList,
    [STOCKS_PRICES_RECEIVED]: onStocksPrices
};

export default createReducerObject(handlers, initialState);