import test from 'ava';

import { testState as state } from '~client-test/test_data/state';
import {
    getTargets
} from '~client/selectors/graph';

test('getTargets gets a list of savings targets', t => {
    const result = getTargets(state);

    t.deepEqual(result, [
        {
            date: 1517443199.999,
            from: 13502,
            months: 12,
            last: 3,
            tag: '1y',
            value: 20897
        },
        {
            date: 1527811199.999,
            from: 14230,
            months: 36,
            last: 6,
            tag: '3y',
            value: 19487
        },
        {
            date: 1530403199.999,
            from: 12678,
            months: 60,
            last: 12,
            tag: '5y',
            value: 26496
        }
    ]);
});
