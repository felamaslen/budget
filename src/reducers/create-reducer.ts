import { Reducer } from 'redux';
import { SocketAction, ErrorAction } from '~/actions/types';
import { ERRORED } from '~/constants/actions.rt';

interface ReducerProps<S> {
  initialState: S;
  onError?: (state: S, action: ErrorAction) => Partial<S>;
  handlers: {
    [actionType: string]: (state: S, action: SocketAction) => Partial<S>;
  };
}

export default function createReducer<S>({
  initialState,
  onError,
  handlers,
}: ReducerProps<S>): Reducer<S, SocketAction | ErrorAction> {
  const isError = (action: SocketAction | ErrorAction): action is ErrorAction =>
    action.type === ERRORED;
  const isHandled = (action: SocketAction | ErrorAction): action is SocketAction =>
    action.type !== ERRORED && action.type in handlers;

  return (state: S | undefined = initialState, action: SocketAction | ErrorAction): S => {
    if (isError(action) && onError) {
      return {
        ...state,
        ...onError(state, action as ErrorAction),
      };
    }
    if (isHandled(action)) {
      return {
        ...state,
        ...handlers[action.type](state, action),
      };
    }

    return state;
  };
}
