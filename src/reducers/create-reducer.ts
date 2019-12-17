import { Reducer } from 'redux';
import { SocketAction, ErrorAction, ActionPayload } from '~/types/actions';
import { ERRORED } from '~/constants/actions.rt';

interface ReducerProps<S, P> {
  initialState: S;
  onError?: (state: S, action: ErrorAction) => Partial<S>;
  handlers: {
    [actionType: string]: (state: S, action: SocketAction<P>) => Partial<S>;
  };
}

export default function createReducer<S, P = ActionPayload>({
  initialState,
  onError,
  handlers,
}: ReducerProps<S, P>): Reducer<S, SocketAction<P> | ErrorAction> {
  const isError = (action: SocketAction<P> | ErrorAction): action is ErrorAction =>
    action.type === ERRORED;
  const isHandled = (action: SocketAction<P> | ErrorAction): action is SocketAction<P> =>
    action.type !== ERRORED && action.type in handlers;

  return (state: S | undefined = initialState, action: SocketAction<P> | ErrorAction): S => {
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
