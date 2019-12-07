import { ERRORED } from '~/constants/actions.rt';

type Payload = object | string | number;

export interface SocketAction {
  type: string;
  __FROM_SOCKET__?: boolean;
  payload: Payload | Payload[] | undefined;
}

export interface ErrorAction<T> extends SocketAction {
  type: typeof ERRORED;
  actionType: T;
  payload: {
    error: string;
  };
}
