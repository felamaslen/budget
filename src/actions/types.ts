import { ERRORED } from '~/constants/actions.rt';
import { SOCKET_ERRORED } from '~/constants/actions.app';

type Payload = object | string | number;
export type ActionPayload = Payload | Payload[] | undefined;

export interface SocketAction {
  type: string;
  __FROM_SOCKET__?: boolean;
  payload: ActionPayload;
}

export interface SocketErrorAction {
  type: typeof SOCKET_ERRORED;
  message: string;
}

export interface ErrorAction<T> extends SocketAction {
  type: typeof ERRORED;
  actionType: T;
  payload: {
    error: string;
  };
}
