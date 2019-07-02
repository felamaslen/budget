import * as actions from '~client/constants/actions/api';

export const dataRead = (res, err = null) => ({ type: actions.DATA_READ, res, err });

export const syncRequested = () => ({ type: actions.SYNC_REQUESTED });

export const syncReceived = (requests, res) => ({ type: actions.SYNC_RECEIVED, requests, res });

export const syncErrorOccurred = (requests, err) => ({ type: actions.SYNC_ERROR_OCCURRED, requests, err });
