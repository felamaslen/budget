import { SagaIterator, eventChannel, EventChannel } from '@redux-saga/core';
import { actionChannel, fork, cancel, select, take, call, put } from '@redux-saga/core/effects';
import io from 'socket.io-client';

import config from '~/config';
import * as socketActions from '~/constants/actions.rt';
import { SocketAction, SocketErrorAction } from '~/actions/types';
import { socketReady, socketErrored } from '~/actions/app';
import { onLoginToggle } from '~/sagas/login';
import { getToken, getLoggedIn } from '~/selectors/login';

interface SocketEvent {
  type: string;
  data: object;
}

const socketActionTypes: string[] = Object.values(socketActions);

const makeListenChannel = (
  socket: SocketIOClient.Socket,
): EventChannel<SocketEvent | SocketErrorAction> =>
  eventChannel((emit: (event: SocketEvent | SocketErrorAction) => void): (() => void) => {
    socketActionTypes.forEach((eventType: string) => {
      socket.on(eventType, (data: object) =>
        emit({
          type: eventType,
          data,
        }),
      );
    });

    return (): void => {
      socket.close();
    };
  });

function* listenToSocket(socket: SocketIOClient.Socket): SagaIterator {
  const channel = yield call(makeListenChannel, socket);
  while (true) {
    const { type, data }: SocketEvent = yield take(channel);
    const action: SocketAction = {
      type,
      __FROM_SOCKET__: true,
      payload: data,
    };

    yield put(action);
  }
}

function* sendToSocket(socket: SocketIOClient.Socket): SagaIterator {
  const channel = yield actionChannel(socketActionTypes);
  while (true) {
    const { type, payload, __FROM_SOCKET__ = true } = yield take(channel);
    if (!__FROM_SOCKET__) {
      yield call([socket, 'emit'], type, payload);
    }
  }
}

function connect(token: string): Promise<SocketIOClient.Socket> {
  return new Promise((resolve, reject) => {
    const socket = io.connect(`${config.webUrl}` || '', {
      query: { token },
    });

    socket.on('connect', () => {
      resolve(socket);
    });

    socket.on('connect_error', (err: Error) => {
      reject(new Error(`Socket connection failed: ${err.message}`));
    });

    socket.on('error', (err: string) => {
      reject(new Error(err));
    });
  });
}

export function* createSocket(token: string): SagaIterator {
  try {
    const socket = yield call(connect, token);

    yield fork(listenToSocket, socket);
    yield fork(sendToSocket, socket);
    yield put(socketReady());
  } catch (err) {
    yield put(socketErrored(err));
  }
}

export default function* ioSaga(): SagaIterator {
  let task = null;
  let isLoggedIn = yield select(getLoggedIn);
  while (true) {
    if (task) {
      yield cancel(task);
    }
    if (isLoggedIn) {
      const token = yield select(getToken);
      task = yield fork(createSocket, token);
    }
    isLoggedIn = yield call(onLoginToggle);
  }
}
