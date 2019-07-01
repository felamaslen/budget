import * as actions from '~client/constants/actions/api';

export const syncRequested = () => ({ type: actions.SYNC_REQUESTED });

export const syncReceived = (res, err = null) => ({
    type: actions.SYNC_RECEIVED,
    res,
    err
});
