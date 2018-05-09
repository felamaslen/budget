/**
 * Actions called to manipulate graphs
 */

import * as A from '../constants/actions';

export const aShowAllToggled = () => ({ type: A.GRAPH_SHOWALL_TOGGLED });
export const aFundItemGraphToggled = key => ({ type: A.GRAPH_FUND_ITEM_TOGGLED, key });
export const aFundsGraphClicked = () => ({ type: A.GRAPH_FUNDS_CLICKED });
export const aFundsGraphZoomed = req => ({ type: A.GRAPH_FUNDS_ZOOMED, ...req });
export const aFundsGraphLineToggled = index => ({ type: A.GRAPH_FUNDS_LINE_TOGGLED, index });
export const aFundsGraphPeriodReceived = res => ({ type: A.GRAPH_FUNDS_PERIOD_LOADED, ...res });
export const aFundsGraphPeriodChanged = req => ({ type: A.GRAPH_FUNDS_PERIOD_CHANGED, ...req });

