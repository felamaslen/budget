import * as actions from '~client/constants/actions/api';

export const dataRead = (res) => ({ type: actions.DATA_READ, res });

export const syncRequested = () => ({ type: actions.SYNC_REQUESTED });

export const syncLocked = () => ({ type: actions.SYNC_LOCKED });
export const syncUnlocked = () => ({ type: actions.SYNC_UNLOCKED });

export const syncReceived = (res) => ({
    type: actions.SYNC_RECEIVED,
    res,
});

export const syncErrorOccurred = (requests, err) => ({ type: actions.SYNC_ERROR_OCCURRED, requests, err });
