import { ErrorAction } from '~/actions/types';
import { ERRORED } from '~/constants/actions.rt';

export const errored = (err: Error, actionType: string): ErrorAction<string> => ({
  type: ERRORED,
  __FROM_SOCKET__: false,
  actionType,
  payload: {
    error: err.message,
  },
});
