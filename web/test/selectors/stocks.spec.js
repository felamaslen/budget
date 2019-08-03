import test from 'ava';
import {
    getStocks,
    getIndices,
    getStocksList
} from '~client/selectors/stocks';
import { testState as state } from '~client-test/test_data/state';

test('getStocks gets stocks list', t => {
    t.is(getStocks(state), state.stocks.shares);
});

test('getIndices gets indices list', t => {
    t.is(getIndices(state), state.stocks.indices);
});

test('getStocksList returns a list of stocks and indices, with their gains', t => {
    const result = getStocksList(state);

    t.deepEqual(result, [
        {
            name: 'CTY.L',
            title: 'City of London Investment Trust'
        },
        {
            name: 'SMT.L',
            title: 'Scottish Mortgage Investment Trust',
            price: 546,
            gainPercent: 100 * (546 - 568.5) / 568.5,
            lastGainPercent: 100 * (546 - 544.3) / 544.3,
            graph: [
                [0, 100 * (542 - 568.5) / 568.5],
                [60, 100 * (539 - 568.5) / 568.5],
                [120, 100 * (544.3 - 568.5) / 568.5],
                [180, 100 * (546 - 568.5) / 568.5]
            ]
        },
        {
            name: 'S&P 500'
        },
        {
            name: 'FTSE 100'
        }
    ]);
});
