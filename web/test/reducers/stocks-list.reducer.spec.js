import test from 'ava';
import { List as list } from 'immutable';

import { limitTimeSeriesLength } from '~client/reducers/stocks-list.reducer';

test.todo('rHandleStocksListResponse');

test('limitTimeSeriesLength filtering time series according to a least-distance algorithm', t => {
    const series = list([
        list([1, 10110]),
        list([1.9, 19092]),
        list([3, 99123]),
        list([4.2, 82782]),
        list([5.8, 11823]),
        list([6.9, 88123]),
        list([8.1, 12939]),
        list([9, 99123]),
        list([10.1, 91723]),
        list([11.5, 91231])
    ]);

    const result = limitTimeSeriesLength(series, 3).toJS();

    t.deepEqual(result, [
        [4.2, 82782],
        [6.9, 88123],
        [11.5, 91231]
    ]);

    const resultLong = limitTimeSeriesLength(series, 6).toJS();

    t.deepEqual(resultLong, [
        [3, 99123],
        [4.2, 82782],
        [5.8, 11823],
        [6.9, 88123],
        [10.1, 91723],
        [11.5, 91231]
    ]);
});

test.todo('rHandleStocksPricesResponse');

