import test from 'ava';

import {
    separateLines,
    formatValue,
} from '~client/modules/funds';
import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';

test('separateLines separates a list of data into separate lines', (t) => {
    const line = [
        [0, 10],
        [1, 11],
        [2, 10.5],
        [3, 0],
        [4, 0],
        [5, 9.4],
        [6, 9.8],
        [7, 10.3],
        [8, 0],
        [9, 15.1],
        [10, 14.9],
    ];

    const result = separateLines(line);

    t.deepEqual(result, [
        [[0, 10], [1, 11], [2, 10.5]],
        [[5, 9.4], [6, 9.8], [7, 10.3]],
        [[9, 15.1], [10, 14.9]],
    ]);
});

test('formatValue returns a percentage if the mode is ROI', (t) => {
    t.is(formatValue(13.2984, GRAPH_FUNDS_MODE_ROI), '13.30%');
});

test('formatValue returns a currency value otherwise', (t) => {
    t.is(formatValue(931239), '£9.3k');
    t.is(formatValue(8919232, 'something'), '£89.2k');
});
