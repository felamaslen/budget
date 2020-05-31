import { Request, ReadResponse, SyncResponse } from '~client/types';

export enum ActionTypeApi {
  DataRead = '@@api/DATA_READ',
  SyncRequested = '@@api/SYNC_REQUESTED',
  SyncLocked = '@@api/SYNC_LOCKED',
  SyncAttempted = '@@api/SYNC_ATTEMPTED',
  SyncUnlocked = '@@api/SYNC_UNLOCKED',
  SyncReceived = '@@api/SYNC_RECEIVED',
  SyncErrorOccurred = '@@api/SYNC_ERROR_OCCURRED',
}

export type ActionApiDataRead = {
  type: ActionTypeApi.DataRead;
  res: ReadResponse;
};

export const dataRead = (res: ReadResponse): ActionApiDataRead => ({
  type: ActionTypeApi.DataRead,
  res,
});

export type ActionApiSyncRequested = {
  type: ActionTypeApi.SyncRequested;
};

export const syncRequested = (): ActionApiSyncRequested => ({ type: ActionTypeApi.SyncRequested });

export type ActionApiSyncLocked = {
  type: ActionTypeApi.SyncLocked;
};

export const syncLocked = (): ActionApiSyncLocked => ({ type: ActionTypeApi.SyncLocked });

export type ActionApiSyncUnlocked = {
  type: ActionTypeApi.SyncUnlocked;
};

export type ActionApiSyncAttempted = {
  type: ActionTypeApi.SyncAttempted;
  backoffIndex: number;
  unlock: boolean;
};

export const syncAttempted = (backoffIndex = 0, unlock = false): ActionApiSyncAttempted => ({
  type: ActionTypeApi.SyncAttempted,
  backoffIndex,
  unlock,
});

export const syncUnlocked = (): ActionApiSyncUnlocked => ({ type: ActionTypeApi.SyncUnlocked });

export type ActionApiSyncReceived = {
  type: ActionTypeApi.SyncReceived;
  res: SyncResponse;
};

export const syncReceived = (res: SyncResponse): ActionApiSyncReceived => ({
  type: ActionTypeApi.SyncReceived,
  res,
});

export type ActionApiSyncErrorOccurred = {
  type: ActionTypeApi.SyncErrorOccurred;
  requests: Request[];
  err: Error;
};

export const syncErrorOccurred = (requests: Request[], err: Error): ActionApiSyncErrorOccurred => ({
  type: ActionTypeApi.SyncErrorOccurred,
  requests,
  err,
});

export type ActionApi =
  | ActionApiDataRead
  | ActionApiSyncRequested
  | ActionApiSyncLocked
  | ActionApiSyncAttempted
  | ActionApiSyncUnlocked
  | ActionApiSyncReceived
  | ActionApiSyncErrorOccurred;
