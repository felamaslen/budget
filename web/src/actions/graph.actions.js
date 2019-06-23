/**
 * Actions called to manipulate graphs
 */

import * as A from '~client/constants/actions';

export const aFundsGraphClicked = () => ({ type: A.GRAPH_FUNDS_CLICKED });
export const aFundsGraphLineToggled = index => ({ type: A.GRAPH_FUNDS_LINE_TOGGLED, index });
export const aFundsGraphPeriodReceived = res => ({ type: A.GRAPH_FUNDS_PERIOD_LOADED, ...res });
export const aFundsGraphPeriodChanged = req => ({ type: A.GRAPH_FUNDS_PERIOD_CHANGED, ...req });
