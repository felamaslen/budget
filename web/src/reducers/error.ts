import { createReducerObject } from 'create-reducer-object';
import { replaceAtIndex } from 'replace-array';

import { ERROR_OPENED, ERROR_CLOSED, ERROR_REMOVED } from '~client/constants/actions/error';

export type State = {
  id: string;
  message: {
    text: string;
    level: number;
  };
  closed?: boolean;
}[];

export const initialState = [];

export default createReducerObject<State>(
  {
    [ERROR_OPENED]: (state, { id, message }) => [...state, { id, message }],
    [ERROR_CLOSED]: (state, { id }) =>
      replaceAtIndex(
        state,
        state.findIndex(({ id: messageId }) => messageId === id),
        item => ({ ...item, closed: true }),
      ),
    [ERROR_REMOVED]: (state, { id }) => state.filter(({ id: messageId }) => messageId !== id),
  },
  initialState,
);
