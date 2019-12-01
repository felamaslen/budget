import { SagaIterator, eventChannel, EventChannel } from '@redux-saga/core';
import { actionChannel, fork, cancel, select, take, call, put } from '@redux-saga/core/effects';
import io from 'socket.io-client';

import config from '~/config';
import * as socketActions from '~/constants/actions.rt';
import { SocketAction } from '~/actions/types';
import { onLoginToggle } from '~/sagas/login';
import { getToken } from '~/selectors/login';

interface SocketEvent {
  type: string;
  data: any;
}

const socketActionTypes: string[] = Object.values(socketActions);

const makeListenChannel = (socket: any): EventChannel<SocketEvent> =>
  eventChannel((emit: (event: SocketEvent) => void) => {
    socketActionTypes.forEach((eventType: string) => {
      socket.on(eventType, (data: any) =>
        emit({
          type: eventType,
          data,
        }),
      );
    });

    return () => socket.close();
  });

function* listenToSocket(socket: any): SagaIterator {
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

function* sendToSocket(socket: any): SagaIterator {
  const channel = yield actionChannel(socketActionTypes);
  while (true) {
    const { type, payload, __FROM_SOCKET__ = true } = yield take(channel);
    if (!__FROM_SOCKET__) {
      yield call([socket, 'emit'], type, payload);
    }
  }
}

export function* createSocket(token: string): SagaIterator {
  const socket = yield call<any>(io, config.webUrl, {
    query: {
      token,
    },
  });

  yield fork(listenToSocket, socket);
  yield fork(sendToSocket, socket);
}

export default function* ioSaga(): SagaIterator {
  let task = null;
  while (true) {
    const isLoggedIn = yield call(onLoginToggle);
    if (task) {
      yield cancel(task);
    }
    if (isLoggedIn) {
      const token = yield select(getToken);
      task = yield fork(createSocket, token);
    }
  }
}
