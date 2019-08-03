import makeIo from 'socket.io';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from '~api/modules/sockets/reducer';
import makeSaga from '~api/modules/sockets/saga';

import {
    CLIENT_CONNECTED
} from '~api/modules/sockets/actions';

function getStore(io) {
    const sagaMiddleware = createSagaMiddleware();

    const store = applyMiddleware(sagaMiddleware)(createStore)(reducer);

    sagaMiddleware.run(makeSaga(io));

    return store;
}

export function setupSockets(app) {
    const io = makeIo(app);
    const store = getStore(io);

    io.on('connection', socket => store.dispatch({
        type: CLIENT_CONNECTED,
        socket
    }));
}
