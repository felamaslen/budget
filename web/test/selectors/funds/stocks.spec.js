import test from 'ava';
import { fromJS } from 'immutable';
import {
    getStocksListInfo
} from '~client/selectors/funds/stocks';

test('getStocksListInfo returns stocks and indices', t => {
    t.deepEqual(getStocksListInfo(fromJS({
        other: {
            stocksList: {
                stocks: 'foo',
                indices: 'bar'
            }
        }
    })), {
        stocks: 'foo',
        indices: 'bar'
    });
});

