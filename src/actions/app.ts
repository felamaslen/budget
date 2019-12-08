import { ErrorAction, SocketErrorAction } from '~/actions/types';
import { ERRORED } from '~/constants/actions.rt';
import { SOCKET_ERRORED } from '~/constants/actions.app';

export const errored = (err: Error, actionType: string): ErrorAction<string> => ({
  type: ERRORED,
  __FROM_SOCKET__: false,
  actionType,
  payload: {
    error: err.message,
  },
});

export const socketErrored = (err: Error): SocketErrorAction => ({
  type: SOCKET_ERRORED,
  message: err.message,
});
