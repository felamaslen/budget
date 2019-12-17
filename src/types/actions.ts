import { ERRORED } from '~/constants/actions.rt';
import { SOCKET_READY, SOCKET_ERRORED } from '~/constants/actions.app';

type Payload = object | string | number;
export type ActionPayload = Payload | Payload[] | undefined;

export interface SocketAction<P = ActionPayload> {
  type: string;
  __FROM_SOCKET__?: boolean;
  payload?: P;
}

export interface SocketReadyAction {
  type: typeof SOCKET_READY;
}

export interface SocketErrorAction {
  type: typeof SOCKET_ERRORED;
  message: string;
}

export interface ErrorAction extends SocketAction {
  type: typeof ERRORED;
  actionType: string;
  payload: {
    error: string;
  };
}

export const isErrorAction = (action: SocketAction): action is ErrorAction =>
  action.type === ERRORED;
