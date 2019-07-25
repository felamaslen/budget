import test from 'ava';

import {
    getFundsRows
} from '~client/selectors/funds/helpers';

import { DELETE } from '~client/constants/data';

test('getFundsRows excludes optimistically deleted items', t => {
    t.deepEqual(getFundsRows({
        funds: {
            items: [
                { item: 'foo fund', __optimistic: DELETE },
                { item: 'bar fund' }
            ]
        }
    }), [{ item: 'bar fund' }]);
});

test('getFundsRows orders by item', t => {
    t.deepEqual(getFundsRows({
        funds: {
            items: [
                { item: 'foo fund' },
                { item: 'bar fund' }
            ]
        }
    }), [
        { item: 'bar fund' },
        { item: 'foo fund' }
    ]);
});
