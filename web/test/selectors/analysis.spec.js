import test from 'ava';
import {
    requestProps
} from '~client/selectors/analysis';

test('requestProps gets the loading status, period, grouping and timeIndex', t => {
    t.deepEqual(requestProps({
        other: {
            analysis: {
                loading: true,
                period: 100,
                grouping: 200,
                timeIndex: 300
            }
        }
    }), {
        loading: true,
        period: 100,
        grouping: 200,
        timeIndex: 300
    });
});
