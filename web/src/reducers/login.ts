import { createReducerObject, Action } from 'create-reducer-object';

import {
  LOGIN_REQUESTED,
  LOGIN_ERROR_OCCURRED,
  LOGGED_IN,
  LOGGED_OUT,
} from '~client/constants/actions/login';

export type State = {
  initialised: boolean;
  loading: boolean;
  error: string | null;
  uid: string | null;
  name: string | null;
};

export const initialState: State = {
  initialised: false,
  loading: false,
  error: null,
  uid: null,
  name: null,
};

const handlers = {
  [LOGIN_REQUESTED]: (): Partial<State> => ({ loading: true }),
  [LOGIN_ERROR_OCCURRED]: (_: State, { err }: Action): Partial<State> => ({
    initialised: true,
    loading: false,
    error: err,
  }),
  [LOGGED_IN]: (_: State, { res: { uid, name } }: Action): State => ({
    initialised: true,
    loading: false,
    error: null,
    uid,
    name,
  }),
  [LOGGED_OUT]: (): State => ({
    ...initialState,
    initialised: true,
  }),
};

export default createReducerObject<State>(handlers, initialState);
