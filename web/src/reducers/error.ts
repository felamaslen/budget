import { createReducerObject } from 'create-reducer-object';
import { replaceAtIndex } from 'replace-array';

import { ActionTypeError } from '~client/actions/error';
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

export default createReducerObject<State>(
  {
    [ActionTypeError.Opened]: (state, { id, message }) => [...state, { id, message }],
    [ActionTypeError.Closed]: (state, { id }) =>
      replaceAtIndex(
        state,
        state.findIndex(({ id: messageId }) => messageId === id),
        (item) => ({ ...item, closed: true }),
      ),
    [ActionTypeError.Removed]: (state, { id }) =>
      state.filter(({ id: messageId }) => messageId !== id),
  },
  initialState,
);
