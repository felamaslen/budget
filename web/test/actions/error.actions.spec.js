import test from 'ava';

import {
    aErrorOpened,
    aErrorClosed,
    aErrorRemoved
} from '~client/actions/error.actions';

import {
    ERROR_OPENED,
    ERROR_CLOSED,
    ERROR_REMOVED
} from '~client/constants/actions';

test('aErrorOpened returns ERROR_OPENED with message', t => {
    const result = aErrorOpened({ foo: 'bar' });

    t.is(result.type, ERROR_OPENED);
    t.deepEqual(result.message, { foo: 'bar' });
    t.is(typeof result.msgId, 'number');
    t.true(result.msgId > 0);
});

test('aErrorClosed returns ERROR_CLOSED with msgId', t => {
    t.deepEqual(aErrorClosed(10), {
        type: ERROR_CLOSED,
        msgId: 10
    });
});

test('aErrorRemoved returns ERROR_REMOVED with msgId', t => {
    t.deepEqual(aErrorRemoved(10), {
        type: ERROR_REMOVED,
        msgId: 10
    });
});
