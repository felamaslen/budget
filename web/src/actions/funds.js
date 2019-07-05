import * as actions from '~client/constants/actions/funds';

export const fundsViewSoldToggled = () => ({ type: actions.FUNDS_VIEW_SOLD_TOGGLED });

export const fundsPeriodChanged = (period, fromCache = true) => ({
    type: actions.FUNDS_PERIOD_CHANGED,
    period,
    fromCache
});

export const fundsPeriodLoaded = (period, res = null) => ({
    type: actions.FUNDS_PERIOD_LOADED,
    res,
    period
});
