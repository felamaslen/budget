import test from 'ava';
import {
    getApiKey
} from '~client/selectors/api';

test('getApiKey gets the API key from the state', t => {
    t.is(getApiKey({
        api: {
            key: 'foo'
        }
    }), 'foo');
});
