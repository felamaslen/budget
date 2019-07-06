import test from 'ava';
import {
    getLoggedIn
} from '~client/selectors/app';

test('getLoggedIn returns true iff there is an API key and a user ID in state', t => {
    t.is(getLoggedIn({
        api: {
            key: 'foo'
        },
        login: {
            user: { uid: 'bar' }
        }
    }), true);

    t.is(getLoggedIn({
        api: {
            key: 'foo'
        },
        login: {
            user: { uid: null }
        }
    }), false);

    t.is(getLoggedIn({
        api: {
            key: null
        },
        login: {
            user: { uid: 'bar' }
        }
    }), false);
});
