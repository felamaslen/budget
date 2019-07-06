import * as actions from '~client/constants/actions/funds';

export const fundsViewSoldToggled = () => ({ type: actions.FUNDS_VIEW_SOLD_TOGGLED });

export const fundsRequested = (fromCache = true, period = null) => ({
    type: actions.FUNDS_REQUESTED,
    fromCache,
    period
});

export const fundsReceived = (period, res = null) => ({
    type: actions.FUNDS_RECEIVED,
    res,
    period
});
