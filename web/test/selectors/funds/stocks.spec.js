import test from 'ava';
import {
    getStocks,
    getIndices,
} from '~client/selectors/funds/stocks';
import { testState as state } from '~client-test/test_data/state';

test('getStocks gets stocks list', (t) => {
    t.deepEqual(getStocks(state), []);
});

test('getIndices gets indices list', (t) => {
    t.deepEqual(getIndices(state), [
        {
            code: 'SPX', name: 'S&P 500', gain: 0, up: false, down: false,
        },
    ]);
});
