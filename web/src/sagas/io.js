import { call } from 'redux-saga/effects';
import socketIo from 'socket.io-client';

export default function *ioSaga() {
    const io = yield call(socketIo);

    return io;
}
