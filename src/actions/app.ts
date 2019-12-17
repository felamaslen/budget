import { ErrorAction, SocketReadyAction, SocketErrorAction } from '~/actions/types';
import { ERRORED } from '~/constants/actions.rt';
import { SOCKET_READY, SOCKET_ERRORED } from '~/constants/actions.app';

export const errored = (err: Error, actionType: string): ErrorAction => ({
  type: ERRORED,
  __FROM_SOCKET__: false,
  actionType,
  payload: {
    error: err.message,
  },
});

export const socketReady = (): SocketReadyAction => ({
  type: SOCKET_READY,
});

export const socketErrored = (err: Error): SocketErrorAction => ({
  type: SOCKET_ERRORED,
  message: err.message,
});
