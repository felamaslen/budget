import test from 'ava';
import { testSaga } from 'redux-saga-test-plan';
import socketIo from 'socket.io-client';

import ioSaga from '~client/sagas/io';

test('io saga calls socket.io', t => {
    const io = { isSocketIoInstance: true };

    testSaga(ioSaga)
        .next()
        .call(socketIo)
        .next(io)
        .returns(io);

    t.pass();
});
