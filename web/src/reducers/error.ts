import { replaceAtIndex } from 'replace-array';

import { Action, ActionTypeError } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';

export type Message = {
  id: string;
  message: {
    text: string;
    level: ErrorLevel;
  };
  closed?: boolean;
};

export type State = Message[];

export const initialState = [];

export default function error(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeError.Opened:
      return [...state, { id: action.id, message: action.message }];
    case ActionTypeError.Closed:
      return replaceAtIndex(
        state,
        state.findIndex(({ id }) => id === action.id),
        (item) => ({ ...item, closed: true }),
      );
    case ActionTypeError.Removed:
      return state.filter(({ id }) => id !== action.id);

    default:
      return state;
  }
}
