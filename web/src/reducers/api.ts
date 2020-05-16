import { createReducerObject, Action } from 'create-reducer-object';

import {
  DATA_READ,
  SYNC_REQUESTED,
  SYNC_LOCKED,
  SYNC_UNLOCKED,
  SYNC_RECEIVED,
  SYNC_ERROR_OCCURRED,
} from '~client/constants/actions/api';
import { LOGGED_IN, LOGGED_OUT } from '~client/constants/actions/login';

export type State = {
  loading: boolean;
  initialLoading: boolean;
  locked: boolean;
  error: Error | null;
  key: string | null;
};

export const initialState: State = {
  loading: false,
  initialLoading: false,
  locked: false,
  error: null,
  key: null,
};

const handlers = {
  [DATA_READ]: (): Partial<State> => ({ initialLoading: false }),
  [SYNC_REQUESTED]: (): Partial<State> => ({ loading: true }),
  [SYNC_LOCKED]: (): Partial<State> => ({ locked: true }),
  [SYNC_UNLOCKED]: (): Partial<State> => ({ locked: false }),
  [SYNC_RECEIVED]: (): Partial<State> => ({ loading: false, error: null }),
  [SYNC_ERROR_OCCURRED]: (_: State, { err }: Action): Partial<State> => ({
    loading: false,
    error: err,
  }),
  [LOGGED_IN]: (_: State, { res: { apiKey } }: Action): Partial<State> => ({
    key: apiKey,
    initialLoading: true,
  }),
  [LOGGED_OUT]: (): Partial<State> => initialState,
};

export default createReducerObject<State>(handlers, initialState);
