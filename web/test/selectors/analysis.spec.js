import test from 'ava';
import { fromJS } from 'immutable';
import {
    requestProps
} from '~client/selectors/analysis';

test('requestProps gets the loading status, period, grouping and timeIndex', t => {
    t.deepEqual(requestProps(fromJS({
        other: {
            analysis: {
                loading: true,
                period: 100,
                grouping: 200,
                timeIndex: 300
            }
        }
    })), {
        loading: true,
        period: 100,
        grouping: 200,
        timeIndex: 300
    });
});

