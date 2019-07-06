import test from 'ava';
import {
    getNow
} from '~client/selectors/now';

test('getNow gets the current time from the state', t => {
    t.is(getNow({ now: 'foo' }), 'foo');
});
