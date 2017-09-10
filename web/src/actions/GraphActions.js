/**
 * Actions called to manipulate graphs
 */

import buildMessage from '../messageBuilder';
import {
    AC_GRAPH_SHOWALL_TOGGLED, AC_GRAPH_FUND_ITEM_TOGGLED,
    AC_GRAPH_FUNDS_CLICKED, AC_GRAPH_FUNDS_ZOOMED,
    AC_GRAPH_FUNDS_HOVERED, AC_GRAPH_FUNDS_LINE_TOGGLED,
    AC_GRAPH_FUNDS_PERIOD_CHANGED, AC_GRAPH_FUNDS_PERIOD_LOADED
} from '../constants/actions';

export const aShowAllToggled = () => buildMessage(AC_GRAPH_SHOWALL_TOGGLED);
export const aFundItemGraphToggled = key => buildMessage(AC_GRAPH_FUND_ITEM_TOGGLED, key);
export const aFundsGraphClicked = () => buildMessage(AC_GRAPH_FUNDS_CLICKED);
export const aFundsGraphZoomed = obj => buildMessage(AC_GRAPH_FUNDS_ZOOMED, obj);
export const aFundsGraphHovered = position => buildMessage(AC_GRAPH_FUNDS_HOVERED, position);
export const aFundsGraphLineToggled = index => buildMessage(AC_GRAPH_FUNDS_LINE_TOGGLED, index);
export const aFundsGraphPeriodChanged = (period, noCache) => {
    return buildMessage(AC_GRAPH_FUNDS_PERIOD_CHANGED, { period, noCache });
};
export const aFundsPeriodLoaded = response => buildMessage(AC_GRAPH_FUNDS_PERIOD_LOADED, response);

