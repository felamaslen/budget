import * as actions from '~client/constants/actions/funds';

export const fundsViewSoldToggled = () => ({ type: actions.FUNDS_VIEW_SOLD_TOGGLED });
export const graphFundsClicked = () => ({ type: actions.GRAPH_FUNDS_CLICKED });
export const fundsPeriodChanged = period => ({ type: actions.FUNDS_PERIOD_CHANGED, period });
export const fundsPeriodLoaded = period => ({ type: actions.FUNDS_PERIOD_LOADED, period });

export const stocksListRequested = () => ({ type: actions.STOCKS_LIST_REQUESTED });
export const stocksListReceived = (res, err = null) => ({ type: actions.STOCKS_LIST_RECEIVED, res, err });
export const stockPricesRequested = () => ({ type: actions.STOCKS_PRICES_REQUESTED });
export const stockPricesReceived = (res, err = null) => ({ type: actions.STOCKS_PRICES_RECEIVED, res, err });
