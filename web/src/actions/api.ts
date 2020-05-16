import { Action } from 'create-reducer-object';
import * as actions from '~client/constants/actions/api';
import { ReadResponse, SyncResponse } from '~client/types/api';
import { Request } from '~client/types/crud';

export const dataRead = (res: ReadResponse): { type: string; res: ReadResponse } => ({
  type: actions.DATA_READ,
  res,
});

export const syncRequested = (): Action => ({ type: actions.SYNC_REQUESTED });

export const syncLocked = (): Action => ({ type: actions.SYNC_LOCKED });
export const syncUnlocked = (): Action => ({ type: actions.SYNC_UNLOCKED });

export const syncReceived = (res: SyncResponse): Action & { res: SyncResponse } => ({
  type: actions.SYNC_RECEIVED,
  res,
});

export const syncErrorOccurred = (requests: Request[], err: Error): Action => ({
  type: actions.SYNC_ERROR_OCCURRED,
  requests,
  err,
});
