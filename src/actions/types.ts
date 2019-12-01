import { ERRORED } from '~/constants/actions.rt';

export interface SocketAction {
  type: string;
  __FROM_SOCKET__?: boolean;
  payload: any;
}

export interface ErrorAction<T> extends SocketAction {
  type: typeof ERRORED;
  actionType: T;
  payload: {
    error: string;
  };
}
